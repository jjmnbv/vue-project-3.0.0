<template>
  <div class="page" id="bond_deal">
    <mt-header class="bar-nav" title="转让">
      <mt-button slot="left" icon="back" v-back-link></mt-button>
    </mt-header>
    <div class="bond-ag">
      <div class="bond-ag-top clearfix">
        <p class="margin-t-20">可转让金额</p>
        <p class="margin-t-10">{{resdata.bondValue | currency('',2)}}元</p>
      </div>
    </div>
    <div class="form-input">
      <label>转让金额(元)</label>
      <input type="number" v-model="bondMoney" name="" placeholder="请输入金额" class="input-text" readonly/>
    </div>
    <div class="form-input">
      <label>折溢价率(%)</label>
      <input type="text" name="" @click="showhide" placeholder="请选择折溢价率" class="input-text" v-model="discountApr" readonly onfocus="this.blur()" />
      <img src="../../../assets/images/public/arrow_down.png" class="arrow-down">
    </div>
    <div class="discount-rate">折溢价率范围为<i class="main-color">{{resdata.min | decimals(1)}}% ~ {{resdata.max | decimals(1)}}%</i></div>
    <div class="transfer-price">
      <label>转让价格(元)</label>
      <span class="main-color">{{bondPrice | currency('',2)}}</span>
    </div>
    <div class="protocol-contract margin-b-15">
      <span @click="switchImg">
          <span v-if="switch_status">
            <input type="hidden" name="protocol" value="1">
            <img src="../../../assets/images/public/protocol_s.png" class="select-img"/>
          </span>
          <span v-else>
            <input type="hidden" name="protocol" value="0">
            <img  src="../../../assets/images/public/protocol_n.png" class="select-img" />
          </span>
      </span>
      <span>我已阅读并同意<i class="main-color" @click="readProtocol()">《债权转让协议》</i></span>
    </div>
    <div class="margin-lr-15">
      <mt-button v-if="!bondMoney || !discountApr || !switch_status" type="default" disabled size="large" >确定转让</mt-button>
      <mt-button v-else type="danger" @click.native="submitAjax" size="large" >
        <loading v-if="submitData" :task="false"></loading>
        <span v-else>确定转让</span>
      </mt-button>
    </div>
    <p class="warm-tip color-999" v-html="resdata.warmTips"></p>
    <mt-popup v-model="popupVisible" position="bottom" class="pop-area">
      <mt-picker ref="discount" :slots="slots" @change="onValuesChange" :show-toolbar="true">
        <div class="picker-toolbar aui-border-b">
          <span class="mint-datetime-action mint-datetime-cancel" @click="popupVisible = false">取消</span>
          <span class="mint-datetime-action mint-datetime-confirm" @click="confirmApr">确定</span>
        </div>
      </mt-picker>
    </mt-popup>
    <div class="protocol-con">
      <mt-popup v-model="popupVisible2" position="bottom" class="mint-popup-3" :modal="false">
        <mt-header class="bar-nav" title="债权转让协议" >
          <mt-button slot="right" @click.native="popupVisible2 = false">关闭</mt-button>
        </mt-header>
        <div class="content" v-html="protocolHtml"></div>
      </mt-popup>
    </div>
  </div>
</template>
<script>
  import * as ajaxUrl from '../../../ajax.config'
  import { setMoney} from '../../../directives/inputRegex'
  import Loading from '../../../components/Loading.vue'
  import qs from 'qs'
  var max = JSON.parse(sessionStorage.bondApr_max)
  var min = JSON.parse(sessionStorage.bondApr_min)
  var apr = {
    '+': max,
    '-': min
  }
  export default {
    name:'bondDeal',
    watch: {
      popupVisible (val) {
        if(val) {
          document.querySelector('.arrow-down').classList.add('rotate-up')
        }else{
          document.querySelector('.arrow-down').classList.remove('rotate-up')
        }
      }
    },
    methods: {
      confirmApr(){
        this.showhide()
        if(this.discountApr == ''){
          this.discountApr = '+' + max[0]
        }
        let apr = Number(this.discountApr)
        this.bondPrice = this.resdata.bondValue * (1 + apr/100)
      },
      showhide() {
        this.popupVisible = !this.popupVisible;
      },
      onValuesChange(picker, values) {
        picker.setSlotValues(1, apr[values[0]]);
        this.discountApr = values[0] + values[1];
      },
      switchImg () { //protocol
        this.switch_status = !this.switch_status
      },
      submitAjax(){
        if(!this.switch_status){
          this.$toast('请阅读并同意协议')
          return ;
        }
        let params = {
          userId: this.$store.state.user.userId,
          __sid: this.$store.state.user.__sid,
          agree: 1,
          bondMoney: this.bondMoney,
          bondApr: this.discountApr,
          commitBondToken: this.resdata.commitBondToken,
          investId: this.$route.query.uuid,
          projectId: this.resdata.projectId,
          ruleId: this.resdata.ruleId,
          startPeriod: this.resdata.startPeriod
        }
        this.submitData = true;
        this.$http.post(ajaxUrl.bondSetCommit, qs.stringify(params)).then((res) => {
          if(res.data.resMsg == '债权发布成功'){
            this.$messagebox({
              title: ' ',
              showCancelButton: false,
              confirmButtonText: '知道了',
              closeOnClickModal: false,
              message: res.data.resMsg
            }).then(action => {
              if(action == 'confirm'){
                this.$router.go(-1)
              }
            });
          }else{
            this.$toast(res.data.resMsg)
          }
          this.submitData = false;
        })
      },
      readProtocol(){
        this.popupVisible2 = true
        let params = Object.assign(this.urlParams, {protocolId: this.resdata.protocolId})
        this.$http.get(ajaxUrl.getBondProtocolContent,{params: params}).then((res) => {
          this.protocolHtml = res.data.resData.content
        })
      }
    },
    created(){
      if(this.$route.query.tab){  //返回上一页需要用
        sessionStorage.tab = this.$route.query.tab
      }
      this.$http.get(ajaxUrl.toBondSet, { params: this.urlParams }).then((res) => {
        this.resdata = res.data.resData
        this.bondMoney = this.resdata.bondValue
        this.resdata.warmTips = res.data.resData.warmTips.replace(/\n/g, '<br/>')
      })
    },
    directives:{money: setMoney},
    components:{Loading},
    data() {
      return {
        urlParams: {
          id: this.$route.query.uuid,
          userId: this.$store.state.user.userId,
          __sid: this.$store.state.user.__sid
        },
        slots: [
          {
            flex: 1,
            values: Object.keys(apr),
            className: 'slot1',
            textAlign: 'center'
          }, {
            divider: true,
            content: '',
            className: 'slot2'
          }, {
            flex: 1,
            values: max,
            className: 'slot3',
            textAlign: 'center'
          }
        ],
        discountApr: '',
        popupVisible: false,
        popupVisible2: false,
        protocolHtml: '',
        switch_status: false,
        bondMoney:'',
        submitData: false,
        resdata: '',
        bondPrice: '0'
      };
    }
  }
</script>
<style scoped>
  .pop-area {width: 100%;}
  .bond-ag-top{
    background: #F95A28;
    height: .8rem;
    width: 100%;
    padding: 0 5%;
    float: left;
  }
  .bond-ag-top p{
    float: left;
    width: 100%;
    line-height: 1;
    font-size: .16rem;
    color: #fff;
    font-family: arial;
  }
  .form-input{
    height: .45rem;
    width: 100%;
    padding: 0 5%;
    background: #fff;
    float: left;
    margin-top: .15rem;
    position: relative;
  }
  .form-input label{
    float: left;
    width: 30%;
    display: block;
    line-height: .45rem;
  }
  .input-text{
    float: left;
    width: 70%;
    border: none;
    outline: none;
    height: .3rem;
    line-height: .3rem;
    margin-top: .075rem;
  }
  .arrow-down {
    position: absolute;
    right: .15rem;
    top: 50%;
    width: 12px;
    margin-top: -6px;
    transform: rotateZ(0deg); transition: .2s ease-out;
  }
  .arrow-down.rotate-up {transform: rotateZ(-180deg);}
  .warm-tip { padding: .15rem;font-size: .12rem;}
  .discount-rate{
    float: left;
    width: 100%;
    padding: 0 5%;
    margin-top: .1rem;
    font-size: .12rem;
    color: #999;
  }
  .transfer-price{
    float: left;
    width: 100%;
    padding: 0 5%;
    height: .5rem;
    line-height: .5rem;
    font-size: .16rem;
  }
  .transfer-price label{
    display: block;
    float: left;
    width: 30%;
  }
  .slot2 {
    width: 50px;
  }
  .mint-datetime-confirm,.mint-datetime-cancel{
    color: #666;
  }
  .mint-datetime-cancel {
    text-align: left;
    padding-left: .25rem;
  }
  .mint-datetime-confirm {
    text-align: right;
    padding-right: .25rem;
  }
  .value-change{
    width: 100%;
    height: 100%;
    position: absolute;
    background: rgba(0,0,0,0.5);
    top: 0;
    left: 0;
  }

</style>
