const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  errorLogs: state => state.errorLog.logs,
  // 管理员信息
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  // 认证信息
  accessToken: state => state.user.accessToken,
  refreshToken: state => state.user.refreshToken,
  // 权限信息
  permissions: state => state.permission.permissions,
  permission_routes: state => state.permission.routes
}
export default getters
