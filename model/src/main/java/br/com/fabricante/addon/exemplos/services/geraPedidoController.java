package br.com.fabricante.addon.exemplos.services;

import br.com.sankhya.jape.EntityFacade;
import br.com.sankhya.jape.bmp.PersistentLocalEntity;
import br.com.sankhya.jape.dao.EntityDAO;
import br.com.sankhya.jape.dao.EntityPropertyDescriptor;
import br.com.sankhya.jape.dao.JdbcWrapper;
import br.com.sankhya.jape.dao.PersistentObjectUID;
import br.com.sankhya.jape.sql.NativeSql;
import br.com.sankhya.jape.vo.DynamicVO;
import br.com.sankhya.jape.vo.EntityVO;
import br.com.sankhya.jape.wrapper.JapeFactory;
import br.com.sankhya.jape.wrapper.JapeWrapper;
import br.com.sankhya.modelcore.auth.AuthenticationInfo;
import br.com.sankhya.modelcore.util.DynamicEntityNames;
import br.com.sankhya.modelcore.util.EntityFacadeFactory;
import br.com.sankhya.studio.annotations.Service;
import br.com.sankhya.studio.annotations.enums.EJBTransactionType;
import br.com.sankhya.studio.persistence.Transactional;
import br.com.sankhya.ws.ServiceContext;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.sankhya.util.BigDecimalUtil;
import com.sankhya.util.TimeUtils;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

/**
 * Servico html5 que gera o pedido de compra a partir da cotacao.
 *
 * Adaptado da acao de botao GeraPedidoCompraCotacaoHomolog (br.com.data.comercial.acoes),
 * substituindo os utilitarios do projeto "dars" (AcessoBanco / ErroUtils / Utilitarios)
 * por equivalentes com a API padrao Sankhya, e trocando a origem dos dados:
 *   - contextoAcao.getLinhas()          -> array NUMCOTACOES (cotacoes das linhas selecionadas)
 *   - contextoAcao.getParam("CODTIPVENDA") -> parametro CODTIPVENDA
 *   - contextoAcao.setMensagemRetorno() -> ctx.setJsonResponse()
 *
 * Corpo JSON (plano) esperado: { "CODTIPVENDA": "5", "NUMCOTACOES": ["123","124"] }
 */
@Service(serviceName = "geraPedidoSP", transactionType = EJBTransactionType.Supports)
public class geraPedidoController {

    private static final JapeWrapper cabDAO = JapeFactory.dao("CabecalhoNota");   // TGFCAB
    private static final JapeWrapper iteDAO = JapeFactory.dao("ItemNota");        // TGFITE
    private static final JapeWrapper relDAO = JapeFactory.dao("AD_DARSRELCOT");   // AD_DARSRELCOT
    private static final JapeWrapper topDAO = JapeFactory.dao("TipoOperacao");    // TGFTOP
    private static final JapeWrapper itcDAO = JapeFactory.dao("ItemCotacao");     // TGFITC
    private static final JapeWrapper sisDAO = JapeFactory.dao("ParametroSistema");// TSIPAR
    private static final JapeWrapper restDAO = JapeFactory.dao("RestricaoTop");   // TGFREP
    private static final JapeWrapper tpvDAO = JapeFactory.dao("TipoNegociacao");  // TGFTPV
    private static final JapeWrapper cttDAO = JapeFactory.dao("Contato");         // TGFCTT
    private static final JapeWrapper usuDAO = JapeFactory.dao(DynamicEntityNames.USUARIO);

    @Transactional
    public void geraPedido(ServiceContext ctx) throws Exception {

        // ctx.getJsonRequestBody() ja retorna um JsonObject (nao String) nesta versao.
        JsonObject req = ctx.getJsonRequestBody();
        if (req == null) {
            disparaErro("Requisicao vazia.");
        }
        String rawBody = String.valueOf(req);
        System.out.println("[geraPedidoSP] requestBody=" + rawBody);

        // Parametro do popup (equivale a contextoAcao.getParam("CODTIPVENDA"))
        String codtipvenda = asString(req, "CODTIPVENDA");
        if (codtipvenda == null) {
            // DEBUG temporario: mostra o corpo recebido para diagnosticar o payload.
            disparaErro("Informe o tipo de negociacao (CODTIPVENDA). [DEBUG corpo recebido: " + rawBody + "]");
        }

        // NUMCOTACOES das linhas selecionadas (JSON plano enviado pelo front) -> cotacoes a processar
        Set<BigDecimal> numCotacoes = new LinkedHashSet<>();
        JsonElement numCotacoesEl = req.get("NUMCOTACOES");
        if (numCotacoesEl != null && numCotacoesEl.isJsonArray()) {
            for (JsonElement e : numCotacoesEl.getAsJsonArray()) {
                if (e != null && !e.isJsonNull()) {
                    String s = e.getAsString();
                    if (s != null && !s.trim().isEmpty()) {
                        numCotacoes.add(new BigDecimal(s.trim()));
                    }
                }
            }
        }
        if (numCotacoes.isEmpty()) {
            disparaErro("Nenhuma cotacao informada.");
        }

        JdbcWrapper jdbc = EntityFacadeFactory.getDWFFacade().getJdbcWrapper();
        jdbc.openSession();

        try {
            // MAPA PARA CONTROLAR OS PEDIDOS GERADOS APENAS NESTA EXECUCAO (RODADA)
            Map<String, BigDecimal> pedidosDaSessao = new HashMap<>();
            Collection<BigDecimal> nuNotas = new ArrayList<>();
            String pedidos = null;

            BigDecimal codusuinc = AuthenticationInfo.getCurrent().getUserID(); // usuario logado

            // modelo de nota padrao para pedido de compra de acordo com o parametro
            BigDecimal codmodeloped = sisDAO.findOne("CHAVE=?", "pedidocompra").asBigDecimal("INTEIRO");
            DynamicVO cabVO = cabDAO.findOne("NUNOTA = ?", codmodeloped);

            for (BigDecimal numcotacao : numCotacoes) {

                // Cabecalho da cotacao (equivale ao 'linha' do botao de acao).
                // OBS: ajuste as colunas conforme o schema do cliente caso alguma nao exista em TGFCOT.
                ResultSet cotRs = queryOne(jdbc,
                        "SELECT CODEMP, SITUACAO, CODUSUREQ, CODNAT FROM TGFCOT WHERE NUMCOTACAO = ?", numcotacao);
                if (cotRs == null) {
                    disparaErro("Cotacao " + numcotacao + " nao encontrada.");
                }

                BigDecimal codemp = cotRs.getBigDecimal("CODEMP");
                String situacao = cotRs.getString("SITUACAO");
                BigDecimal codUsuReq = cotRs.getBigDecimal("CODUSUREQ");
                BigDecimal codnat = cotRs.getBigDecimal("CODNAT");

                BigDecimal codVend = BigDecimal.ZERO;
                DynamicVO usuVO = usuDAO.findByPK(codUsuReq);
                if (usuVO != null) {
                    codVend = usuVO.asBigDecimalOrZero("CODVEND");
                }

                if ("F".equals(situacao)) {
                    disparaErro("COTACAO ESTA FECHADA!" + "\n" +
                            "PEDIDO DE COMPRA NAO PODE SER GERADO!");
                }

                DynamicVO itcLibVO = itcDAO.findOne("NUMCOTACAO = ? AND SITUACAO = 'A' AND NUNOTACPA IS NULL", numcotacao);
                String tipfrete = "S";
                String modfrete = "C";
                if (itcLibVO != null) {
                    if (itcLibVO.asString("AD_TIPFRETE") != null) {
                        tipfrete = itcLibVO.asString("AD_TIPFRETE");
                    }
                    if (itcLibVO.asString("MODFRETE") != null) {
                        modfrete = itcLibVO.asString("MODFRETE");
                    }
                } else {
                    disparaErro("Os itens da cotacao nao estao aprovados, aprove para gerar o pedido de compra");
                }

                // seleciona a solicitacao na tabela temporaria AD_DARSRELCOT
                Collection<DynamicVO> solicitacao = relDAO.find("NUMCOTACAO=? AND isnull(SITUACAO,'P')='P'", numcotacao);
                for (DynamicVO sol : solicitacao) {

                    DynamicVO cab = cabDAO.findOne("NUNOTA=?", sol.asBigDecimal("NUNOTA"));
                    BigDecimal codcencus = cab.asBigDecimal("CODCENCUS");
                    String prioridade = cab.asString("AD_PRIORIDADEATEND");
                    String moturgencia = cab.asString("AD_MOTIVOURGENCIA");
                    String codtipoper = String.valueOf(cab.asBigDecimal("CODTIPOPER"));
                    Timestamp dhtipoper = getDataMaxTipoOper(jdbc, BigDecimalUtil.valueOf(codtipoper));
                    BigDecimal diferenciador = sol.asBigDecimalOrZero("DIFERENCIADOR");

                    // seleciona top de destino da solicitacao
                    ResultSet topRs = queryOne(jdbc,
                            "SELECT CODTIPOPERDESTINO FROM TGFTOP WHERE CODTIPOPER=? AND DHALTER=?",
                            BigDecimalUtil.valueOf(codtipoper), dhtipoper);
                    BigDecimal topdestino = (topRs == null) ? null : topRs.getBigDecimal("CODTIPOPERDESTINO");

                    if (topdestino == null
                            || topDAO.findOne("CODTIPOPER=? AND DHALTER=? AND CODTIPOPERDESTINO=?",
                            BigDecimalUtil.valueOf(codtipoper), dhtipoper, topdestino) == null) {
                        disparaErro("TOP DE DESTINO PARA PEDIDO DE COMPRA NAO INFORMADO PARA TOP DA SOLICITACAO "
                                + sol.asBigDecimal("NUNOTA"));
                    }

                    Timestamp dhtopdestino = getDataMaxTipoOper(jdbc, topdestino);

                    DynamicVO destinoVO = topDAO.findOne("CODTIPOPER=? AND DHALTER=? AND TIPMOV ='O'", topdestino, dhtopdestino);
                    if (destinoVO == null) {
                        disparaErro("TOP de destino da solicitacao nao e pedido de compra. Favor corrigir o cadastro.");
                    }

                    BigDecimal numos = sol.asBigDecimalOrZero("NUMOS");
                    BigDecimal codcencusite = sol.asBigDecimal("CODCENCUS");
                    BigDecimal codprod = sol.asBigDecimal("CODPROD");

                    // seleciona dados do item na cotacao
                    DynamicVO itcVO = itcDAO.findOne(
                            "NUMCOTACAO=? AND CODPROD=? AND DIFERENCIADOR=? AND SITUACAO IN ('A') AND NUNOTACPA IS NULL ",
                            numcotacao, codprod, diferenciador);
                    if (itcVO == null) {
                        continue;
                    }

                    BigDecimal codparc = itcVO.asBigDecimalOrZero("CODPARC");
                    BigDecimal codlocalorig = itcVO.asBigDecimalOrZero("CODLOCAL");
                    BigDecimal cotacaoite = itcVO.asBigDecimalOrZero("NUMCOTACAO");
                    BigDecimal codproj = itcDAO.findOne(
                            "NUMCOTACAO=? AND CODPROD=? AND DIFERENCIADOR=? AND SITUACAO IN ('P') ",
                            numcotacao, codprod, diferenciador).asBigDecimalOrZero("AD_CODPROJ");

                    DynamicVO cttVO = cttDAO.findOne("CODPARC=? AND AD_CONTPRINCOMPRAS ='S'", codparc);
                    BigDecimal codcontato = null;
                    if (cttVO != null) {
                        codcontato = cttVO.asBigDecimalOrZero("CODCONTATO");
                    }

                    // verifica se o tipo de negociacao esta nas restricoes da top de destino
                    Timestamp dhtipvenda = getDataMaxTipvenda(jdbc, BigDecimalUtil.valueOf(codtipvenda));
                    DynamicVO rest = restDAO.findOne("CODTIPOPER=? AND TIPREST = 'T' AND RESTRICAO = 'S'", topdestino);
                    if (rest != null) {
                        DynamicVO tiponegVO = tpvDAO.findOne(
                                "CODTIPVENDA IN (SELECT CODCOLREST FROM TGFREP WHERE CODTIPOPER = ? AND TIPREST = 'T' AND RESTRICAO = 'S') AND CODTIPVENDA=?",
                                topdestino, codtipvenda);
                        if (tiponegVO == null) {
                            disparaErro("TIPO DE NEGOCIACAO SELECIONADO NAO PODE SER USADO NA TOP DE PEDIDO DE COMPRA." + "\n" +
                                    " FAVOR ESCOLHER OUTRO TIPO DE NEGOCIACAO!");
                        }
                    }

                    BigDecimal nunotacpa = itcVO.asBigDecimal("NUNOTACPA");
                    BigDecimal sequencia = BigDecimal.ZERO;
                    BigDecimal nunotaPedido = BigDecimal.ZERO;

                    // Chave de agrupamento: CODPARC-NUMCOTACAO-CODEMP-CODCENCUS
                    String chaveAgrupamento = String.valueOf(codparc) + "-" +
                            String.valueOf(numcotacao) + "-" +
                            String.valueOf(codemp) + "-" +
                            String.valueOf(codcencus);

                    if (nunotacpa == null) {

                        if (!pedidosDaSessao.containsKey(chaveAgrupamento)) {
                            // 1o item dessa combinacao nesta rodada: cria um novo pedido
                            Map<String, Object> alteracoes = new HashMap<>();
                            alteracoes.put("NUMNOTA", BigDecimal.ZERO);
                            alteracoes.put("CODEMP", codemp);
                            alteracoes.put("CODPARC", codparc);
                            alteracoes.put("STATUSNOTA", "A");
                            alteracoes.put("CODTIPOPER", topdestino);
                            alteracoes.put("DHTIPOPER", dhtopdestino);
                            alteracoes.put("CODTIPVENDA", BigDecimalUtil.valueOf(codtipvenda));
                            alteracoes.put("DHTIPVENDA", dhtipvenda);
                            alteracoes.put("DTNEG", TimeUtils.getNow());
                            alteracoes.put("DTFATUR", TimeUtils.getNow());
                            alteracoes.put("DTMOV", TimeUtils.getNow());
                            alteracoes.put("DTENTSAI", TimeUtils.getNow());
                            alteracoes.put("DTALTER", TimeUtils.getNow());
                            alteracoes.put("TIPMOV", "O");
                            alteracoes.put("CODUSUINC", codusuinc);
                            alteracoes.put("CODCENCUS", codcencus);
                            alteracoes.put("CODNAT", codnat);
                            alteracoes.put("CODPROJ", codproj);
                            alteracoes.put("NUMCOTACAO", numcotacao);
                            alteracoes.put("AD_PRIORIDADEATEND", prioridade);
                            alteracoes.put("AD_MOTIVOURGENCIA", moturgencia);
                            alteracoes.put("CODCONTATO", codcontato);
                            alteracoes.put("TIPFRETE", tipfrete);
                            alteracoes.put("CIF_FOB", modfrete);
                            alteracoes.put("AD_ORIGACAO", "S");
                            alteracoes.put("CODVEND", codVend);

                            DynamicVO cabecalho = duplicaRegistroVO(cabVO, "CabecalhoNota", alteracoes);
                            nunotaPedido = cabecalho.asBigDecimal("NUNOTA");
                            nuNotas.add(nunotaPedido);
                            pedidos = (pedidos == null ? "" : pedidos + ", ") + nunotaPedido.toString();
                            sequencia = BigDecimal.ZERO;

                            // guarda a nota gerada para reaproveitar nos proximos itens da mesma combinacao
                            pedidosDaSessao.put(chaveAgrupamento, nunotaPedido);
                        } else {
                            // 2o item (ou mais) da mesma combinacao: usa a nota ja criada e puxa a ultima sequencia
                            nunotaPedido = pedidosDaSessao.get(chaveAgrupamento);
                            ResultSet seqRs = queryOne(jdbc, "SELECT MAX(SEQUENCIA) AS MAXSEQ FROM TGFITE WHERE NUNOTA = ?", nunotaPedido);
                            BigDecimal maxSeq = (seqRs == null) ? null : seqRs.getBigDecimal("MAXSEQ");
                            sequencia = maxSeq != null ? maxSeq : BigDecimal.ZERO;
                        }
                    }

                    String codvol = itcVO.asString("CODVOL");
                    BigDecimal qtd = sol.asBigDecimalOrZero("QTDNEG");
                    BigDecimal vlrunit = itcVO.asBigDecimal("PRECO");
                    BigDecimal vlrtot = qtd.multiply(vlrunit);
                    String obs = itcVO.asString("OBS");
                    codprod = itcVO.asBigDecimal("CODPROD");
                    sequencia = sequencia.add(BigDecimal.ONE);

                    DynamicVO iteSolVO = iteDAO.findOne("NUNOTA=? AND CODPROD=?", sol.asBigDecimal("NUNOTA"), codprod);
                    BigDecimal codsol = (iteSolVO == null) ? BigDecimal.ZERO : iteSolVO.asBigDecimalOrZero("AD_CODSOL");

                    Timestamp dtprevista = null;
                    DynamicVO dhentregaVO = itcDAO.findOne(
                            "NUMCOTACAO=? AND CODPROD=? AND DIFERENCIADOR=? AND DHENTREGA IS NOT NULL",
                            numcotacao, codprod, itcVO.asBigDecimal("DIFERENCIADOR"));
                    if (dhentregaVO != null) {
                        dtprevista = itcVO.asTimestamp("DHENTREGA");
                    }

                    update(jdbc,
                            "INSERT INTO TGFITE(NUNOTA,SEQUENCIA,CODEMP,CODPROD,CODVOL,CODLOCALORIG,QTDNEG,VLRUNIT,VLRTOT,ATUALESTOQUE,AD_NUMOS,AD_CODCENCUS,AD_NUMCOTACAO,AD_ORIGEM,OBSERVACAO,DTINICIO,AD_CODSOL) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                            nunotaPedido, sequencia, codemp, codprod, codvol, codlocalorig, qtd, vlrunit, vlrtot,
                            BigDecimal.ZERO, numos, codcencusite, cotacaoite, "0", obs, dtprevista, codsol);

                    update(jdbc, "UPDATE TGFCAB SET VLRNOTA = (SELECT SUM(VLRTOT) FROM TGFITE WHERE NUNOTA=?) WHERE NUNOTA=?",
                            nunotaPedido, nunotaPedido);

                    DynamicVO relprod = relDAO.findOne("NUMCOTACAO=? AND NUNOTA=? AND CODPROD=? AND SEQUENCIA=?",
                            numcotacao, sol.asBigDecimalOrZero("NUNOTA"), codprod, sol.asBigDecimal("SEQUENCIA"));
                    if (relprod != null) {
                        relDAO.prepareToUpdate(relprod)
                                .set("SITUACAO", "A")
                                .update();
                    }

                    itcDAO.prepareToUpdate(itcVO)
                            .set("NUNOTACPA", nunotaPedido)
                            .set("SEQNOTACPA", sequencia)
                            .update();
                }

                // fecha a cotacao se nao houver itens pendentes (mesma regra do botao)
                fecharCotacaoSePossivel(jdbc, numcotacao);
            }

            JsonObject result = new JsonObject();
            result.addProperty("STATUS", "OK");
            if (pedidos == null) {
                result.addProperty("MENSAGEM", "NAO FORAM GERADOS PEDIDOS");
                result.addProperty("PEDIDOS", "");
                result.addProperty("PEDIDOS_GERADOS", 0);
            } else {
                result.addProperty("MENSAGEM", "Processo Finalizado.\nNro. Unico de pedidos gerados: " + pedidos);
                result.addProperty("PEDIDOS", pedidos);
                result.addProperty("PEDIDOS_GERADOS", nuNotas.size());
            }
            ctx.setJsonResponse(result);

        } finally {
            jdbc.closeSession();
        }
    }

    // ------------------------------------------------------------------
    // Regras auxiliares
    // ------------------------------------------------------------------

    /** Fecha a cotacao (TGFCOT) quando nao restam itens pendentes de aprovacao/definicao de fornecedor. */
    private void fecharCotacaoSePossivel(JdbcWrapper jdbc, BigDecimal numcotacao) throws Exception {
        Collection<DynamicVO> itensDaCotacao = itcDAO.find("NUMCOTACAO = ?", numcotacao);
        boolean existemItensPendentes = false;
        for (DynamicVO item : itensDaCotacao) {
            String situacaoItem = item.asString("STATUSPRODCOT");
            BigDecimal codparc = item.asBigDecimalOrZero("CODPARC");
            if (!"C".equals(situacaoItem) && !"A".equals(situacaoItem) && codparc.compareTo(BigDecimal.ZERO) == 0) {
                existemItensPendentes = true;
                break;
            }
        }
        if (!existemItensPendentes) {
            update(jdbc, "UPDATE TGFCOT SET SITUACAO='F', DHFINAL=GETDATE() WHERE NUMCOTACAO=?", numcotacao);
        }
    }

    // ------------------------------------------------------------------
    // Helpers de banco (substituem br.com.sankhya.dars.Utils.*)
    // ------------------------------------------------------------------

    /** Executa um SELECT e retorna o ResultSet posicionado na 1a linha (ou null se nao houver). */
    private ResultSet queryOne(JdbcWrapper jdbc, String sqlStr, Object... params) throws Exception {
        NativeSql sql = new NativeSql(jdbc);
        sql.appendSql(sqlStr);
        for (Object p : params) {
            sql.addParameter(p);
        }
        ResultSet rs = sql.executeQuery();
        return rs.next() ? rs : null;
    }

    /** Executa um INSERT/UPDATE/DELETE nativo. */
    private void update(JdbcWrapper jdbc, String sqlStr, Object... params) throws Exception {
        NativeSql sql = new NativeSql(jdbc);
        sql.appendSql(sqlStr);
        for (Object p : params) {
            sql.addParameter(p);
        }
        sql.executeUpdate();
    }

    /** MAX(DHALTER) da TOP (substitui Utilitarios.getDataMaxTipoOper). */
    private Timestamp getDataMaxTipoOper(JdbcWrapper jdbc, BigDecimal codTipOper) throws Exception {
        if (codTipOper == null) {
            return null;
        }
        ResultSet rs = queryOne(jdbc, "SELECT MAX(DHALTER) AS DT FROM TGFTOP WHERE CODTIPOPER = ?", codTipOper);
        return (rs == null) ? null : rs.getTimestamp("DT");
    }

    /** MAX(DHALTER) do tipo de negociacao (substitui Utilitarios.getDataMaxTipvenda). */
    private Timestamp getDataMaxTipvenda(JdbcWrapper jdbc, BigDecimal codTipVenda) throws Exception {
        if (codTipVenda == null) {
            return null;
        }
        ResultSet rs = queryOne(jdbc, "SELECT MAX(DHALTER) AS DT FROM TGFTPV WHERE CODTIPVENDA = ?", codTipVenda);
        return (rs == null) ? null : rs.getTimestamp("DT");
    }

    /** Duplica um VO limpando a PK e aplicando as alteracoes (substitui Utilitarios.duplicaRegistroVO). */
    private DynamicVO duplicaRegistroVO(DynamicVO voOrigem, String entidade, Map<String, Object> alteracoes) throws Exception {
        EntityFacade dwf = EntityFacadeFactory.getDWFFacade();
        EntityDAO rootDAO = dwf.getDAOInstance(entidade);
        DynamicVO destinoVO = voOrigem.buildClone();

        PersistentObjectUID pkUID = rootDAO.getSQLProvider().getPkObjectUID();
        for (EntityPropertyDescriptor pkField : pkUID.getFieldDescriptors()) {
            destinoVO.setProperty(pkField.getField().getName(), null);
        }

        if (alteracoes != null) {
            for (Map.Entry<String, Object> e : alteracoes.entrySet()) {
                destinoVO.setProperty(e.getKey(), e.getValue());
            }
        }

        PersistentLocalEntity created = dwf.createEntity(entidade, (EntityVO) destinoVO);
        return (DynamicVO) created.getValueObject();
    }

    private void disparaErro(String msg) throws Exception {
        throw new Exception(msg);
    }

    // ------------------------------------------------------------------
    // Leitura do JSON (payload plano enviado pelo front)
    // ------------------------------------------------------------------

    /** Le um parametro de nivel raiz (valor simples). Retorna null se ausente/vazio. */
    private String asString(JsonObject req, String chave) {
        JsonElement el = req.get(chave);
        if (el == null || el.isJsonNull() || el.isJsonObject() || el.isJsonArray()) {
            return null;
        }
        String s = el.getAsString();
        return (s == null || s.trim().isEmpty()) ? null : s;
    }
}
