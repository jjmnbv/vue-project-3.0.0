package com.rd.ifaes.core.sys.service;

import java.util.List;
import java.util.Set;

import com.rd.ifaes.common.orm.Page;
import com.rd.ifaes.core.base.service.BaseService;
import com.rd.ifaes.core.sys.domain.Operator;

/**
 * Service Interface:operatorService
 * @author lh
 * @version 3.0
 * @date 2016-5-30
 */
public interface OperatorService extends BaseService<Operator>{
	
	/**
	 * 查询登录用户
	 * @param loginName	用户登录名
	 * @return
	 */
	Operator getByLoginName(String loginName);
	
	
	/**
	 * 用户角色标示集
	 * @param id
	 * @return
	 */
	Set<String> findRoles(String id);
	
	/**
	 * 用户权限标示集
	 * @param id
	 * @return
	 */
	Set<String> findPermissions(String id);
	
	/**
	 * 查询改角色下的用户列表
	 * @param user
	 * @return
	 */
	Page<Operator> findRoleOperators(Operator user);
	
	/**
	 * 查询在线客服（不分页）
	 * @param user
	 * @return
	 */
	List<Operator> findOnlineServer();

	/**
	 * 修改后台用户密码
	 * 
	 * @author ZhangBiao
	 * @date 2016年9月27日
	 * @param operator
	 */
	void updatePwd(Operator operator);
	
	/**
	 * 重置后台用户密码
	 * 
	 * @author ZhangBiao
	 * @date 2016年9月27日
	 * @param operator
	 */
	void resetOperatorPwd(Operator operator);

	/**
	 * 查询组织机构中后台用户数
	 * @author ZhangBiao
	 * @date 2016年11月3日
	 * @param ids
	 * @return
	 */
	int getNumByOrgIds(String[] ids);
	/**
	 * 修改后台用户状态（是否被锁定）
	 */
	void updateStatus(Operator operator);
	/**
	 * 查询是否是首次登陆
	 */
	 int findIsFirstLogin(Operator operator);
	 /**
	  * 自动解冻后台用户
	  */
	 void unFreezeAccountByTimer();
}