<template>
  <div class="page" id="pageDetail">
    <mt-header class="bar-nav" title="投资">
      <mt-button slot="left" icon="back" @click="backUrl"></mt-button>
    </mt-header>
    <ul class="tab-title">
      <li @click="changeTab(1)"><span :class="{current: active == 'tab-con1'}">持有中</span></li>
      <li @click="changeTab(2)"><span :class="{current: active == 'tab-con2'}">投资申请</span></li>
      <li @click="changeTab(3)"><span :class="{current: active == 'tab-con3'}">已结束</span></li>
    </ul>
    <mt-tab-container class="page-tabbar-tab-container" v-model="active">
      <mt-tab-container-item id="tab-con1">
        <div class="page-loadmore-wrapper" ref="wrapper" :style="{ height: wrapperHeight + 'px' }">
          <no-data v-if="list1.length == 0"></no-data>
          <mt-loadmore :bottom-method="loadBottom" :bottom-all-loaded="allLoaded1" ref="loadmore1">
            <section v-for="item in list1" class="invest-am-list">
              <router-link :to="'/investDetail/'+ item.projectId">
                <div class="invest-am-title">
                  <p class="am-title">
                    {{item.projectName | hideBorrowName}}<i v-if="item.investType == 1" class="invest-am-icon">自</i>
                  </p>
                  <p class="repayment-time">
                    本期回款日：{{item.nextRepayDate | dateFormatFun}}
                  </p>
                </div>
              </router-link>
              <ul class="invest-am-content">
                <li class="invest-am-content-left margin-t-10">已收本息(元)</li>
                <li v-if="item.repayedAmount" class="invest-am-content-right margin-t-10 main-color">{{item.repayedAmount | currency('',2)}}</li>
                <li v-else class="invest-am-content-right margin-t-10 main-color">--</li>
                <li class="invest-am-content-left">待收本息(元)</li>
                <li class="invest-am-content-right main-color">{{item.waitAmount | currency('',2)}}</li>
                <li class="invest-am-content-left">投资金额(元)</li>
                <li class="invest-am-content-right">{{item.amount | currency('',2)}}</li>
                <li class="invest-am-content-left margin-b-10">投资时间</li>
                <li class="invest-am-content-right margin-b-10">{{item.createTime | dateFormatFun(4)}}</li>
              </ul>
              <div class="invest-am-bottom">
                  <mt-button size="normal" @click.native="downloadTips" class="download-btn margin-lf-10">查看协议</mt-button>
                <router-link :to="'/account/myInvest/repayment_plan?investId='+item.uuid">
                  <mt-button size="normal" class="plan-btn">回款计划</mt-button>
                </router-link>
              </div>
            </section>
        </mt-loadmore>
        </div>
      </mt-tab-container-item>
      <mt-tab-container-item id="tab-con2">
        <div class="page-loadmore-wrapper" ref="" :style="{ height: wrapperHeight + 'px' }">
          <no-data v-if="list2.length == 0"></no-data>
          <mt-loadmore :bottom-method="loadBottom" :bottom-all-loaded="allLoaded2" ref="loadmore2">
            <section v-for="item in list2" class="invest-am-list">
              <div class="invest-am-title">
                <router-link :to="'/investDetail/'+ item.projectId">
                <p class="am-title">
                  {{item.projectName | hideBorrowName}}
                  <i class="am-status" :class="{'color-green': item.status == 1}">{{item.statusStr}}</i>
                  <i v-if="item.investType == 1" class="invest-am-icon">自</i>
                </p>
                </router-link>
                <ul class="invest-am-content">
                  <li class="invest-am-content-left margin-t-10">投资金额(元)</li>
                  <li class="invest-am-content-right margin-t-10">{{item.amount | currency('',2)}}</li>
                  <li class="invest-am-content-left margin-b-10">投资时间</li>
                  <li class="invest-am-content-right margin-b-10">{{item.createTime | dateFormatFun(4)}}</li>
                </ul>
                <div v-if="item.status == 0 || item.statusStr == '待支付'" class="invest-am-bottom">
                  <p class="count-time">剩余时间 <count-down :remainTimes="item.remainTimes"></count-down></p>
                  <mt-button size="normal" class="plan-btn" @click.native="toPay(item.uuid)">去支付</mt-button>
                </div>
              </div>
            </section>
          </mt-loadmore>
        </div>
      </mt-tab-container-item>
      <mt-tab-container-item id="tab-con3">
        <div class="page-loadmore-wrapper" ref="wrapper3" :style="{ height: wrapperHeight + 'px' }">
          <no-data v-if="list3.length == 0"></no-data>
          <mt-loadmore :bottom-method="loadBottom" :bottom-all-loaded="allLoaded3" ref="loadmore3">
            <section v-for="item in list3" class="invest-am-list">
              <router-link :to="'/investDetail/'+ item.projectId">
              <div class="invest-am-title">
                <p class="am-title">
                  {{item.projectName | hideBorrowName(35)}}
                  <i v-if="item.investType == 1" class="invest-am-icon">自</i>
                </p>
              </div>
              </router-link>
              <ul class="invest-am-content">
                <li class="invest-am-content-left margin-t-10">投资金额(元)</li>
                <li class="invest-am-content-right margin-t-10">{{item.amount | currency('',2)}}</li>
                <li class="invest-am-content-left margin-b-10">实际收益(元)</li>
                <li class="invest-am-content-right margin-b-10 main-color">{{item.repayedInterest | currency('',2)}}</li>
              </ul>
              <div class="invest-am-bottom">
                <span class="am-bottom-left pull-left">{{item.interestDate | dateFormatFun(1)}} 起息</span>
                <span class="am-bottom-right pull-right">{{item.endDate | dateFormatFun(1)}} 结束</span>
              </div>
            </section>
          </mt-loadmore>
        </div>
      </mt-tab-container-item>
    </mt-tab-container>
  </div>
</template>
<script>
  import * as ajaxUrl from '../../../ajax.config'
  import CountDown from '../../../components/myInvest_countTime.vue'
  import NoData from '../../../components/NoData.vue' //解决苹果无法滑动问题
  export default {
    name: 'myInvest',
    methods: {
      changeTab(index=1){
        this.active = `tab-con${index}`
        // this[`list${index}`] = []
        // this.projectList()
      },
      projectList(active, page=1){
        this.noData = false; // 数据为空判断
        this.$indicator.open({spinnerType: 'fading-circle'}) //提示初始化加载
        this.url1 = ajaxUrl.getBorrowHolding
        this.url2 = ajaxUrl.getInvestApply
        this.url3 = ajaxUrl.getInvestClosed
        let urlParams = {
          'page.page': page,
          userId: this.$store.state.user.userId,
          __sid: this.$store.state.user.__sid,
        }
        // var index = this.active.slice(-1)
        var index = active
        this.$http.get(this[`url${index}`], { params: urlParams }).then((res) => {
          this.$indicator.close() // 关闭提示
          if(res.data.resData.list.length == 0){this.noData = true;}// 数据为空判断
          if(page > res.data.resData.totalPage){
            if(res.data.resData.totalPage > 0){
              this.$toast('无更多数据加载哦~')
            }
            return ; // 请求页大于总页数就返回不执行
          }

          this[`list${index}`] = this[`list${index}`].concat(res.data.resData.list)
          this[`totalPage${index}`] = res.data.resData.totalPage
        })
      },
      loadBottom(id) {
        setTimeout( () => {
          var index = this.active.slice(-1)
          let page = ++this[`page${index}`]
          if( page > this[`totalPage${index}`]){
            this[`allLoaded${index}`] = true;// 若数据已全部获取完毕
          }
          this.projectList(index, page)
          this.$refs[`loadmore${index}`].onBottomLoaded(id);
        }, 1000);
      },
      backUrl(){
        if(this.$route.query.from == 'investBid'){
          this.$router.push({name: 'investBid', params: {projectId: this.$route.query.uuid}, query: {from: 'myInvest'}})
        }else{
          this.$router.push('/account')
        }
      },
      downloadTips(){
        this.$toast('请前往PC端查看并下载协议')
      },
      toPay(uuid){
        window.location.href = ajaxUrl.doPay + '?uuid=' + uuid + '&userId=' + this.$store.state.user.userId + '&__sid=' + this.$store.state.user.__sid
      }
    },
    created() {
      if(sessionStorage.tab) delete sessionStorage.tab
      this.$nextTick(()=>{
        this.wrapperHeight = document.documentElement.clientHeight - this.$refs.wrapper.getBoundingClientRect().top;
        this.projectList(1, 1)
        this.projectList(2, 1)
        this.projectList(3, 1)
      })
    },
    components:{CountDown,NoData},
    data() {
      return {
        active: sessionStorage.tab || 'tab-con1',
        wrapperHeight: 0,
        noData: false,
        list1: [],
        list2: [],
        list3: [],
        allLoaded1: false,
        allLoaded2: false,
        allLoaded3: false,
        page1: 1,
        page2: 1,
        page3: 1,
        totalPage1:1, //tab1默认总页数为1
        totalPage2:1, //tab2默认总页数为1
        totalPage3:1, //tab3默认总页数为1
      };
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../../assets/scss/var.scss";
  .current {color: $main-color;border-bottom: 2px solid $main-color; }
  .tab-title {
    width: 100%;
    height: .4rem;
    background: #fff;
  }
  .tab-title li{
    width: 33.33%;
    line-height: .36rem;
    text-align: center;
    display: inline-block;
    float: left;
  }
  .tab-title li span{
    width: .6rem;
    display: block;
    margin: 0 auto;
  }
  .invest-am-list {
    padding: 0 5%;
    background: #fff;
    margin-top: .1rem;
    float: left;
    width: 100%;
  }
  .invest-am-title {
    border-bottom: 1px solid #DEDEDE;
  }
  .am-title {
    height: .42rem;
    line-height: .42rem;
    font-size: .18rem;
  }
  .invest-am-icon {
    background: #4abe89;
    color: #fff;
    padding: 1px;
    margin-left: .1rem;
    font-size: .12rem;
    border-radius: .02rem;
  }
  .am-status {
    float: right;
    font-size: .14rem;
    font-family: arial;
    color: $main-color;
  }
  .invest-am-content li {
    width: 49%;
    height: .28rem;
    line-height: .28rem;
    display: inline-block;
  }
  .invest-am-content-left {
    color: #999;
    font-size: .12rem;
  }
  .invest-am-content-right {
    text-align: right;
    color: #666;
    font-family: arial;
  }
  .invest-am-bottom {
    border-top: 1px solid #DEDEDE;
  }
  .count-time {
    float: left;
    line-height: .5rem;
    color: #666;
    font-size: .12rem;
  }
  .am-bottom-left, .am-bottom-right {
    line-height: .5rem;
    color: #666;
  }
  .surplus-time {
    float: left;
    line-height: .5rem;
    font-size: .12rem;
  }
  .time-show {
    color: #F95A28;
    margin-left: .1rem;
  }
  .plan-btn, .download-btn {
    height: .3rem;
    margin: .1rem 0;
    display: block;
    float: right;
    text-align: center;
    width: .75rem;
    border-radius: .40rem;
    background: #fff;
    font-size: .14rem;
    padding: 0;
    box-shadow: none;
  }
  .plan-btn {
    border: 1px solid #F95A28;
    color: #F95A28;
  }
  .download-btn {
    border: 1px solid #999;
    color: #666;
    margin-left: .1rem;
  }
  .repayment-time {
    margin-bottom: .1rem;
    color: #666;
  }
  .mint-button:not(.is-disabled):active::after {opacity: 0;}
</style>