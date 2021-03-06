import '../../../common/lib';
import ReactDOM from 'react-dom';
import React from 'react';
import Accountmenu from '../../../component/accountmenu/menu';
import './loan.less';
import Tablelist from '../../../component/tablelist/tablelist';
import {Publiclib} from '../../../common/common';
import { Tooltip } from 'antd';

const timetype = ["个月","天"];
const columns_first = [{
            title: '借款项目',
            dataIndex: 'projectName',
            render(text) {                        
              let TooltipHtml = '',
              newText = text ? text.substr(0,10) : "-";
              if(text && text.length > 10){                
                TooltipHtml = <Tooltip placement="bottom" title={text}><a href="javascript:;" className="iconfont tooltip-icon">&#xe664;</a></Tooltip>;
                newText+="...";
              }
              return <p>
                <span>{newText}</span>
                {TooltipHtml}
              </p>
            }
          },
          {
            title: '借款金额(元)',
            dataIndex: 'account'
          },
          {
            title: '借款年利率',
            dataIndex: 'apr',
            render(text) {
              return text+"%";
            },
          },
          {
            title: '借款期限',
            dataIndex:"timeLimit",
            render: (text, record) => (
              <span>{text}{timetype[record.timeType]}</span>
              ),
          },
          {
            title: '借款时间',
            dataIndex: 'createTime',
            render(text) {
              return Publiclib.formatDate(text,2);
            },
          },
          {
            title: '借款进度',
            dataIndex: 'scales',
            render(text) {
              if(!text || text == 'undefined'){text=0}
              return text+"%";
            },
          },
          {
            title: '状态',
            dataIndex: 'statusStr'
          },
          {
            title: '操作',
            render: (text, record) => {
                    if(record.hasRepaymentProtocol){
                      let link = "/member/myLoan/projectRepayment.html?projectId="+record.id,
                      downlink = "/member/myInvest/downloadProjectProtocol.html?projectId="+record.id;
                       return <span className="tablelink">
                          <a href={downlink} className="linkline">下载协议</a>
                          <a href={link}>还款计划</a>
                        </span>
                    }
                    else
                    {
                      return "-";
                    }
              },
          }];

const config = {single:true,datetime:true,select:true};
// const select = {url:"/public/getSelectList.html?dictType=projectStatus"};
const select = {
  url:"",
  list:[
    {"itemName":"全部状态","itemValue":""},
    {"itemName":"待审核","itemValue":"0,11,1,2"},
    {"itemName":"审核未通过","itemValue":"12,3,30"},
    {"itemName":"募集中","itemValue":"4,49"},
    {"itemName":"成立待审","itemValue":"5"},
    {"itemName":"未成立","itemValue":"7"},
    {"itemName":"还款中","itemValue":"6,8"},
    {"itemName":"已还款","itemValue":"9"},
    {"itemName":"逾期中","itemValue":"87"},
    {"itemName":"担保垫付","itemValue":"92"},
    {"itemName":"逾期还款","itemValue":"91"}
  ]
};

const select_name = 'statusSet';

let Loan = React.createClass({
  render(){
      return (
          <Tablelist config={config} url='/member/myLoan/getLogList.html' tableid="tablelist-first" columns={columns_first} select={select} selectname={select_name}/>
        )
    }
});

ReactDOM.render(<Loan />,  document.getElementById("j-mybond-list"));

ReactDOM.render(<Accountmenu current = {"7"}/>,  document.getElementById("j-sider-menu"));
