package com.rd.ifaes.core.tpp.controller.jxbank;

import com.alibaba.fastjson.JSON;
import com.rd.ifaes.common.dict.CacheKeys;
import com.rd.ifaes.common.dict.ExpireTime;
import com.rd.ifaes.common.dict.TppEnum;
import com.rd.ifaes.core.base.web.BaseController;
import com.rd.ifaes.core.core.constant.Constant;
import com.rd.ifaes.core.core.util.CacheUtils;
import com.rd.ifaes.core.tpp.domain.TppTrade;
import com.rd.ifaes.core.tpp.model.jx.JxBatchRepayModel;
import com.rd.ifaes.core.tpp.service.tpp.JxbankService;
import com.rd.ifaes.core.tpp.service.tpp.TppTradeService;
import com.rd.ifaes.core.tpp.util.JxConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.math.BigDecimal;

@Controller
public class JxBatchRepayController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(JxBatchRepayController.class);
    @Resource
    private TppTradeService tppTradeService;
    @Resource
    private JxbankService jxbankService;

    /**
     * 数据合法性检查的异步通知
     *
     * @param model
     * @param request
     * @param response
     * @author jxx
     * @date 2017年8月18日
     */
    @RequestMapping(value = "/jxbank/batchRepay/notify")
    public void tppNotify(final String bgData, final HttpServletRequest request, final HttpServletResponse response) {
        LOGGER.info("批次还款数据合法性检查的异步回调，回调参数：{}", getRequestParams(request));
        JxBatchRepayModel model = JSON.parseObject(bgData, JxBatchRepayModel.class);
        if (model.responseVerify(model.getDirectResponseValidParamNames())) {
            String tradeNo = model.getTxDate().concat(model.getBatchNo());
            if (!JxConfig.SUCCESS.equals(model.getRetCode())) {
                LOGGER.info("批次号-{}数据合法性检查未通过,retCode-{},retMsg-{}", model.getBatchNo(), model.getRetCode(), model.getRetMsg());
                tppTradeService.updateStatusByTradeNo(tradeNo, TppEnum.STATUS_FAIL.getValue(), TppEnum.STATUS_UNDO.getValue(), model.getRetMsg());
            } else {
                TppTrade tpp = tppTradeService.findByTradeNoAndType(tradeNo, TppEnum.SERVICE_TYPE_BATCH_REPAY.getValue(), TppEnum.STATUS_UNDO.getValue());
                LOGGER.info("批次号-{},交易总金额-{},收到的实际金额汇总-{},收到的实际笔数-{}", model.getBatchNo(), tpp.getMoney(), model.getTxAmount(), model.getTxCounts());
            }
        } else {
            LOGGER.error("验签失败：{}", model.getOrderNo());
        }
        printSuccessReturn(response);
    }


    /**
     * 业务处理结果的异步通知
     *
     * @param bgData
     * @param request
     * @param response
     * @author jxx
     * @date 2017年8月18日
     */
    @RequestMapping(value = "/jxbank/batchRepay/retNotify")
    public void tppRetNotify(final String bgData, final HttpServletRequest request, final HttpServletResponse response) {
        LOGGER.info("批次还款业务处理结果的异步回调，回调参数：{}", getRequestParams(request));
        JxBatchRepayModel model = JSON.parseObject(bgData, JxBatchRepayModel.class);
        if (model.responseVerify()) {
            String tradeNo = model.getTxDate().concat(model.getBatchNo());
            // 重复处理判断(缓存标记)
            String handleKey = String.format(CacheKeys.PREFIX_REPAY_ORDER_NO_HANDLE_NUM.getKey(), tradeNo);
            if (CacheUtils.incr(handleKey, Constant.DOUBLE_ONE) > Constant.DOUBLE_ONE) {
                LOGGER.info("还款回调重复处理----orderNo：{}", tradeNo);
                printSuccessReturn(response);
                return;
            }
            CacheUtils.expire(handleKey, ExpireTime.ONE_HOUR);
            TppTrade tpp = tppTradeService.findByTradeNoAndType(tradeNo, TppEnum.SERVICE_TYPE_BATCH_REPAY.getValue(), TppEnum.STATUS_UNDO.getValue());
            int count = tppTradeService.countByTradeNoAndType(tradeNo, TppEnum.SERVICE_TYPE_REPAY.getValue(), TppEnum.STATUS_UNDO.getValue());
            BigDecimal sucAmount = new BigDecimal(model.getSucAmount());
            BigDecimal failAmount = new BigDecimal(model.getFailAmount());
            int sucCounts = Integer.valueOf(model.getSucCounts());
            if (sucAmount.compareTo(tpp.getMoney()) == 0 && failAmount.compareTo(BigDecimal.ZERO) == 0 && count == sucCounts) {
                //全部成功
                jxbankService.repaySuccess(tpp);
            } else {
                //部分成功
                jxbankService.jxBatchDetailsHandle(tpp);
            }
        } else {
            LOGGER.error("验签失败：{}", model.getOrderNo());
        }
        printSuccessReturn(response);
    }
}
