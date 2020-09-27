import {HttpRequest, ViewSearchWebClient} from 'web-clients';
import config from '../../../config';
import {roleModel} from '../../metadata/RoleModel';
import {Role} from '../../model/Role';
import {RoleSM} from '../../search-model/RoleSM';
import {ApprAccessRoleAssignmentService} from '../ApprRoleAssignmentService';

export class ApprAccessRoleAssignmentServiceImpl extends ViewSearchWebClient<Role, any, RoleSM> implements ApprAccessRoleAssignmentService {
  constructor(http: HttpRequest) {
    super(config.backOfficeUrl + 'common/resources/accessRole', http, roleModel);
  }
}
