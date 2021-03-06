import '../../../common/lib';
import ReactDOM from 'react-dom';
import React from 'react';
import Accountmenu from '../../../component/accountmenu/menu';
import  { ValidateFn} from '../../../common/validateFn';
import  { Reg } from '../../../common/regularFun';
import {Publiclib} from '../../../common/common';
import './recharge.less';
import { Button, Form, Input,Modal} from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;

function showerror() {
  Modal.error({
    title: '温馨提示',
    content: '为了您的资金安全，请开通第三方资金托管账户',
    okText:'开通托管账户',
    iconType:'question-circle',
    onOk() {
        window.location.href = "/member/security/realNameIdentify.html";
    },
    onCancel() {},
  });
}

if($("#j-realNameStatus").val()!=1){
   showerror()
}

let Recharge = React.createClass({
  getInitialState() {
    return {
      count:this.props.money,
      visible:false,
    };
  },
  handleSubmit(e) {

    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('Errors in form!!!');
        e.preventDefault();
        return;
      }
      console.log('Submit!!!');
      console.log(values);
      this.setState({ visible: true });
      // $.ajax({
      //   url: '/user/registerFirst.html',
      //   type: 'POST',
      //   dataType: 'json',
      //   data: values
      // })
      // .done(function(data) {
      //   if(data.result){

      //   }
      //   else
      //   {
      //     error(data.msg);
      //     $(".codeimg")[0].click();
      //   }
      // })
      // .fail(function() {
      //   error('网络异常，请重试！');
      // });
    });

  },
  add(e){
    var that = e.target,money = that.value*1;
    Publiclib.rechargeCheck(that);
    //let singlemin = $("#banknumber").val()-this.props.minamount;

    let number = (this.props.money*1 + e.target.value*1).toFixed(2);

    this.state.count = number;

    // if( singlemin >= 0 ){
    //     this.singlemin = true;
    // }
    // else
    // {
    //     this.singlemin=false;
    // }
  },
   isNumber(rule, value, callback) {
    if(!value){
      callback();
    }else if(value <= 0){
        callback([new Error('充值金额单笔不能小于0元')]);
    }else if(value < this.props.minamount){
        callback([new Error('充值金额单笔不能小于'+this.props.minamount+'元')]);
    }else if(value > this.props.maxamount){
        callback([new Error('充值金额单笔不能大于'+this.props.maxamount+'元')]);
    }else{
      callback();
    }
  },
  handleOk() {
    window.location.href = "/member/recharge/index.html";
  },
  handleCancel() {
    this.setState({ visible: false });
    window.location.reload();
  },
  render(){
            const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
            const banknumberProps = getFieldProps('banknumber', {
                  validate: [
                  {
                    rules:[
                      { required: true, message: '请输入充值金额' }
                    ],trigger: ['onBlur']
                  },
                  {
                    rules:[
                      {validator:this.isNumber},
                    ],trigger: ['onBlur']
                  }
                  ]
                });
            let count = "充值后可用余额 "+ this.state.count +" 元";
            return (
                <div className="account-main">
                <div className="main-title">充值</div>
                  <Form horizontal className="form-themes" style={{marginLeft:100}} target="_blank" action="/member/recharge/doRecharge.html" method="post" form={this.props.form} onSubmit={this.handleSubmit}>
                      <div className="row" style={{width:400,marginBottom:"20px"}}>
                        <div className="col-6 lab form-laber textR">账户余额</div>
                        <div className="col-18 pl20 form-text lab">
                          <em>{this.props.money}</em> 元
                        </div>
                      </div>
                      <div className="row" style={{width:400}}>
                        <div className="col-6 lab form-laber textR">充值金额</div>
                        <div className="col-18 pl20 hasunit">
                          <FormItem extra={count}><Input {...banknumberProps} className="input" onKeyUp ={this.add} style={{fontSize:"18px",color:"#333",lineHeight:"normal"}} name="amount" placeholder="请输入充值金额" maxLength="12"  /></FormItem>
                          <span className="unit">元</span>
                        </div>
                      </div>
                      <div className="row" style={{width:400}}>
                        <div className="col-6">&nbsp;</div>
                        <div className="col-18 pl20">
                          <FormItem><Button className="subbutton" type="primary" htmlType="submit" >确认充值</Button></FormItem>
                        </div>
                      </div>
                      <div className="row" style={{width:400}}>
                        <div className="col-6">&nbsp;</div>
                        <div className="col-18 pl20 remind">
                          <span className="star">*</span>充值操作将在资金托管账户网站进行
                        </div>
                      </div>
                  </Form>
                  <div className="help">
                    <div className="help-title"><em className="iconfont">&#xe639;</em>温馨提示</div>
                    <ol>
                      <li>充值/提现必须为开通网上银行的借记卡，不支持存折、信用卡充值。</li>
                      <li>充值期间，请勿关闭浏览器，待充值成功并返回后，可在网站中查看充值金额。</li>
                      <li>严禁信用卡套现、虚假交易等行为。</li>
                    </ol>
                  </div>

                  <Modal  className="orderPayModal" ref="modal"
                    visible={this.state.visible}
                    title="登录资金账户完成充值" onOk={this.handleOk} onCancel={this.handleCancel}
                    width={480}
                    footer={[
                      <Button key="submit" type="primary" size="large" onClick={this.handleOk}>
                        充值成功
                      </Button>,
                      <Button key="back" type="ghost" size="large" onClick={this.handleCancel}>充值失败</Button>,
                    ]}
                  >
                  <div className="modal-content clearfix"><em className="iconfont fl">&#xe62e;</em><p className="fl">请在新打开的资金托管账户完成充值</p></div>
                  </Modal>
                </div>
              )
          }
});
Recharge = createForm()(Recharge);

ReactDOM.render(<Recharge money={$("#money").val()} maxamount={Number($("#j-rechargeMaxAmount").val())} minamount={Number($("#j-rechargeMinAmount").val())}/>,  document.getElementById("j-rechargemain"));
ReactDOM.render(<Accountmenu current = {"12"}/>,  document.getElementById("j-sider-menu"));
