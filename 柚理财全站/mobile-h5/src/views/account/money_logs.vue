<template>
<div class="page" id="bond">
  <mt-header class="bar-nav" title="变现" >
    <mt-button slot="left" icon="back" v-back-link></mt-button>
  </mt-header>
  <ul class="rd-tab-title">
    <li @click="changeTab(1)">
      <span :class="{current: active == 'tab-con1'}">可变现</span>
    </li>
    <li @click="changeTab(2)">
      <span :class="{current: active == 'tab-con2'}">变现中</span>
    </li>
    <li @click="changeTab(3)">
      <span :class="{current: active == 'tab-con3'}">已变现</span>
    </li>
  </ul>
  <div class="text-center no-data" v-show="noData">
    <img src="../../assets/images/public/default/default_icon_no_record.png" alt="缺省图片">
    <p>暂无记录</p>
  </div>
  <div class="page-tab-container">
    <mt-tab-container class="page-tabbar-tab-container" v-model="active">
      <mt-tab-container-item id="tab-con1">
        <div class="page-loadmore-wrapper" ref="wrapper" :style="{ height: wrapperHeight + 'px' }">
          <mt-loadmore :bottom-method="loadBottom" :bottom-all-loaded="allLoaded" ref="loadmore">
            <div v-for="item in list" class="invest-am-list">
              <router-link :to="'/investDetail/'+ item.projectId">
              <div class="invest-am-title">
                <p class="am-title">{{item.projectName | hideBorrowName(35)}}</p>
                <p class="repayment-time">本期回款日：{{item.nextRepayTime | dateFormatFun}}</p>
              </div>
              </router-link>
              <ul class="info-con clearfix color-999 aui-border-b">
                <li class="margin-t-10">
                  <span class="color-999">预期收益(元)</span>
                  <span class="font-arial main-color pull-right">{{item.interest | currency('',2)}}</span>
                </li>
                <li class="margin-t-10">
                  <span >剩余期限(天)</span>
                  <span class="font-arial pull-right">{{item.remainDays}}</span>
                </li>
                <li class="margin-t-10">
                  <span >投资金额(元)</span>
                  <span class="font-arial pull-right">{{item.amount | currency('',2)}}</span>
                </li>
              </ul>
              <p class="btn-box clearfix">
                <router-link :to="'/account/money_cash/'+item.uuid">
                  <mt-button class="plain-btn red-btn" size="normal" plain>变现</mt-button>
                </router-link>
              </p>
            </div>
          </mt-loadmore>
        </div>
      </mt-tab-container-item>
      <mt-tab-container-item id="tab-con2">
        <div class="page-loadmore-wrapper" ref="" :style="{ height: wrapperHeight + 'px' }">
          <mt-loadmore :bottom-method="loadBottom" :bottom-all-loaded="allLoaded2" ref="loadmore2">
            <div v-for="item in list2" class="invest-am-list">
              <router-link :to="'/realizeDetail/'+ item.projectId +'?tab=tab-con2'">
              <div class="invest-am-title">
                <p class="am-title">{{item.projectName | hideBorrowName}}</p>
              </div>
              </router-link>
              <ul class="info-con clearfix color-999 aui-border-b">
                <li class="margin-t-10">
                  <span class="color-999">变现利率</span>
                  <span class="font-arial main-color pull-right">{{item.apr | currency('',2)}}%</span>
                </li>
                <li class="margin-t-10">
                  <span >变现金额(元)</span>
                  <span class="font-arial pull-right">{{item.account | currency('',2)}}</span>
                </li>
                <li class="margin-t-10">
                  <span >变现进度</span>
                  <span class="font-arial pull-right">{{item.scales | currency('',2)}}%</span>
                </li>
                <li class="margin-t-10">
                  <span >变现申请时间</span>
                  <span class="font-arial pull-right">{{item.createTime | dateFormatFun(4)}}</span>
                </li>
              </ul>
            </div>
          </mt-loadmore>
        </div>
      </mt-tab-container-item>
      <!--变现-->
      <mt-tab-container-item id="tab-con3">
        <div class="page-loadmore-wrapper" ref="" :style="{ height: wrapperHeight + 'px' }">
          <mt-loadmore :bottom-method="loadBottom" :bottom-all-loaded="allLoaded3" ref="loadmore3">
            <div v-for="item in list3" class="invest-am-list">
              <router-link :to="'/investDetail/'+ item.projectId">
              <div class="invest-am-title">
                <p class="am-title">{{item.projectName | hideBorrowName(35)}}</p>
              </div>
              </router-link>
              <ul class="info-con clearfix color-999 aui-border-b">
                <li class="margin-t-10">
                  <span class="color-999">变现利率</span>
                  <span class="font-arial main-color pull-right">{{item.apr | currency('',2)}}%</span>
                </li>
                <li class="margin-t-10">
                  <span >变现金额(元)</span>
                  <span class="font-arial pull-right">{{item.account | currency('',2)}}</span>
                </li>
                <li class="margin-t-10">
                  <span >变现完成时间</span>
                  <span class="font-arial pull-right">{{item.reviewTime | dateFormatFun(4)}}</span>
                </li>
              </ul>
              <p class="btn-box clearfix">
                <router-link :to="'/account/refund_plan?tab=tab-con3&investId='+item.projectId">
                  <mt-button class="plain-btn red-btn" size="normal" plain>还款计划</mt-button>
                </router-link>
              </p>
            </div>
          </mt-loadmore>
        </div>
      </mt-tab-container-item>
    </mt-tab-container>
  </div>
</div>
</template>
<script>
  import * as ajaxUrl from '../../ajax.config'
  export default {
    name:'moneyLogs',
    methods: {
      changeTab(index=1){
        if(index == 1){
          this.active = 'tab-con1'
          this.list = []
        }else if(index == 2){
          this.active = 'tab-con2'
          this.list2 = []
        }else {
          this.active = 'tab-con3'
          this.list3 = []
        }
        this.projectList()
      },
      projectList(page=1){
        this.noData = false; // 数据为空判断
        this.$indicator.open({spinnerType: 'fading-circle'}) //提示初始化加载
        let url
        if(this.active == 'tab-con1'){
          url = ajaxUrl.getRealizeAbleList
        }else if(this.active == 'tab-con2'){
          url = ajaxUrl.getRealizingList
        }else{
          url = ajaxUrl.getRealizedList
        }
        let urlParams = {
          'page.page': page,
          userId: this.$store.state.user.userId,
          __sid: this.$store.state.user.__sid,
        }
        this.$http.get(url, { params: urlParams }).then((res) => {
          this.$indicator.close() // 关闭提示
          if(res.data.resData.list.length == 0){this.noData = true;}// 数据为空判断
          if(page > res.data.resData.totalPage){
            if(res.data.resData.totalPage > 0){
              this.$toast('无更多数据加载哦~')
            }
            return ; // 请求页大于总页数就返回不执行
          }
          if(this.active == 'tab-con1'){
            this.list = this.list.concat(res.data.resData.list)
            this.totalPage1 = res.data.resData.totalPage
          }else if(this.active == 'tab-con2'){
            this.list2 = this.list2.concat(res.data.resData.list)
            this.totalPage2 = res.data.resData.totalPage
          }else{
            this.list3 = this.list3.concat(res.data.resData.list)
            this.totalPage3 = res.data.resData.totalPage
          }
        })
      },
      loadBottom(id) {
        setTimeout(() => {
          if(this.active == 'tab-con1'){
            let page = ++this.page1
            if( page > this.totalPage1){
              this.allLoaded = true;// 若数据已全部获取完毕
            }
            this.projectList(page)
            this.$refs.loadmore.onBottomLoaded(id);
          }else if(this.active == 'tab-con2'){
            let page = ++this.page2
            if(page > this.totalPage2){
              this.allLoaded2 = true;// 若数据已全部获取完毕
            }
            this.projectList(page)
            this.$refs.loadmore2.onBottomLoaded(id);
          }else if(this.active == 'tab-con3'){
            let page = ++this.page3
            if(page > this.totalPage3){
              this.allLoaded3 = true;// 若数据已全部获取完毕
            }
            this.projectList(page)
            this.$refs.loadmore3.onBottomLoaded(id);
          }
        }, 1000)
      }
    },
    created() {
      this.active = sessionStorage.tab || 'tab-con1'
      delete sessionStorage.tab
      this.projectList()
      this.$nextTick(() => {
        this.wrapperHeight = document.documentElement.clientHeight - this.$refs.wrapper.getBoundingClientRect().top;
      })
    },
    data(){
      return {
        active: 'tab-con1',
        wrapperHeight: 0,
        noData: false,
        list: [],
        list2: [],
        list3: [],
        allLoaded: false,
        allLoaded2: false,
        allLoaded3: false,
        page1: 1,
        page2: 1,
        page3: 1,
        totalPage1:1, //tab1默认总页数为1
        totalPage2:1, //tab2默认总页数为1
        totalPage3:1, //tab3默认总页数为1
      }
    }
  }
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/scss/var.scss";
  .rd-tab-title {
    width: 100%;
    height: .4rem;
    background: #fff;
  }
  .rd-tab-title li{
    width: 33.33%;
    line-height: .36rem;
    text-align: center;
    display: inline-block;
    float: left;
  }
  .current {
    color: $main-color;
    border-bottom: 2px solid $main-color;
  }
  .rd-tab-title li span {
    width: .6rem;
    display: block;
    margin: 0 auto;
  }
  .invest-am-list {
    padding: 0 .15rem;
    background: #fff;
    margin-top: .1rem;
  }
  .invest-am-title {
    border-bottom: 1px solid #DEDEDE;
  }
  .am-title {
    height: .42rem;
    line-height: .42rem;
    font-size: .16rem;
  }
  .repayment-time {
    margin-bottom: .1rem;
    color: #666;
  }
  .info-con {font-size: .12rem;padding-bottom:.15rem;}
  .info-con li span:last-child { font-size: .14rem;}
  .btn-box {height: .5rem;}
  .red-btn {
    border: 1px solid $main-color;
    color: $main-color;
  }
  .plain-btn {
    height: .3rem;
    line-height: .28rem;
    width: .75rem;
    margin: .1rem 0;
    border-radius: .05rem;
    font-size: .14rem;
    float:right;
    margin-left: .1rem;
    padding:0;
  }
  .mint-button:not(.is-disabled):active::after {opacity: 0;}

</style>
