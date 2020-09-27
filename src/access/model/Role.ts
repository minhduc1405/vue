import {CtrlStatus} from '../enum/CtrlStatus';
import {ControlModel} from './ControlModel';
import {Module} from './Module';
import {User} from './User';

export class Role extends ControlModel {
  roleId: string;
  cId: string;
  roleDesc: string;
  roleName: string;
  userType: string;
  evUserReg: string;
  evActivate: string;
  modules: Module[];
  assignedBy: string;
  assignedStatus: string;
  assignedCtrlStatus: CtrlStatus;
  assignedDate: Date;
  users: User[];
}
