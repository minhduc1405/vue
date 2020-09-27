import {authenticated} from 'uione';
import {RouteConfig} from 'vue-router';
import DefaultWapper from '../core/DefaultWapper.vue';
import RoleAssignmentComponent from './component/RoleAssignmentComponent.vue';
import RoleAssignmentDiffComponent from './component/RoleAssignmentDiffComponent.vue';
import RoleAssignmentsComponent from './component/RoleAssignmentsComponent.vue';
import RoleComponent from './component/RoleComponent.vue';
import RoleDiffComponent from './component/RoleDiffComponent.vue';
import RolesComponent from './component/RolesComponent.vue';
import UserComponent from './component/UserComponent.vue';
import UserDiffComponent from './component/UserDiffComponent.vue';
import UsersComponent from './component/UsersComponent.vue';

const accessRouter: RouteConfig = {
  path: '/access',
  component: DefaultWapper,
  name: 'access',
  meta: {
    title: '',
    icon: ''
  },
  beforeEnter: (to, from, next) => {
    if (!authenticated()) {
      next({name: 'Login'});
    }
    next();
  },
  children: [
    {path: 'users', component: UsersComponent, name: 'users', meta: {title: '', noCache: true}},
    {path: 'users/add', component: UserComponent, name: 'UserAdd', meta: {title: '', noCache: true}},
    {path: 'users/:id', component: UserComponent, name: 'UserView', meta: {title: '', noCache: true}},
    {
      path: 'users/approve/:entityId',
      component: UserDiffComponent,
      name: 'UserApprove',
      meta: {title: '', noCache: true}
    },
    {path: 'role-definition', component: RolesComponent, name: 'role', meta: {title: '', noCache: true}},
    {
      path: 'role-definition/add',
      component: RoleComponent,
      name: 'role-add',
      meta: {title: '', noCache: true}
    },
    {
      path: 'role-definition/:roleId/:cId',
      component: RoleComponent,
      name: 'role-view',
      meta: {title: '', noCache: true}
    },
    {
      path: 'role-definition/edit/:roleId/:cId',
      component: RoleComponent,
      name: 'role-view',
      meta: {title: '', noCache: true}
    },
    {
      path: 'role-definition/approve/:roleId/:cId',
      component: RoleDiffComponent,
      name: 'role-approve',
      meta: {title: '', noCache: true}
    },
    {
      path: 'role-assignment',
      component: RoleAssignmentsComponent,
      name: 'role-assignment',
      meta: {title: '', noCache: true}
    },
    {
      path: 'role-assignment/add',
      component: RoleAssignmentComponent,
      name: 'role-assignment-add',
      meta: {title: '', noCache: true}
    },
    {
      path: 'role-assignment/:roleId/:cId',
      component: RoleAssignmentComponent,
      name: 'role-assignment-view',
      meta: {title: '', noCache: true}
    },
    {
      path: 'role-assignment/edit/:roleId/:cId',
      component: RoleAssignmentComponent,
      name: 'role-assignment-view',
      meta: {title: '', noCache: true}
    },
    {
      path: 'role-assignment/approve/:roleId/:cId',
      component: RoleAssignmentDiffComponent,
      name: 'role-assignment-approve',
      meta: {title: '', noCache: true}
    }
  ]
};

export default accessRouter;
