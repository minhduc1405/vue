<script lang="ts">
import {alertError} from "ui-alert";
import {showToast} from "ui-toast";
import {getLocale, initForm, initMaterial, storage} from "uione";
import {buildFromUrl, navigate, SearchComponent} from "vue-onex";
import Component from "vue-class-component";
import PaginateVue from "../../core/PaginateVue.vue";
import {Role} from "../model/Role";
import {RoleSM} from "../search-model/RoleSM";
import {applicationContext} from "../config/ApplicationContext";
import {BusinessSearchModelFormatter} from "../config/BusinessSearchModelFormatter";

@Component({
  components: {PaginateVue}
})
export default class RoleAssignmentsComponent extends SearchComponent<Role, RoleSM> {
  // init model search
  roleName = '';
  userTypes = [];
  ctrlStatus = [];

  ctrlStatuslist = [];
  checkedCtrl: string[] = [];
  checkedUserType: string[] = [];

  private roleAssignmentService = applicationContext.roleAssignmentService;
  private masterDataService = applicationContext.masterDataService;

  init(s: RoleSM, auto: boolean) {
    Promise.all([
      this.masterDataService.getUserTypes(),
      this.masterDataService.getCtrlStatus()
    ]).then(vvv => {
      const [userTypeList, ctrlStatusList] = vvv;
      this.ctrlStatuslist = ctrlStatusList;
      this.userTypes = userTypeList;
      this.load(s, auto);
    }).catch(this.handleError);
  }

  updateChecked(value, event, field, checkedList, se) {
    if (this.state[field] !== null && this.state[field] !== undefined) {
      checkedList = this.state[field];
    }
    if (event.target.checked) {
      checkedList.push(value);
    } else {
      for (let i = 0; i < checkedList.length; i++) {
        if (checkedList[i] === value) {
          checkedList.splice(i, 1);
        }
      }
    }
    se[field] = checkedList;
  }

  isChecked(checkedList, value): boolean {
    if (checkedList === null || checkedList === undefined) {
      return false;
    }
    for (let i = 0; i < checkedList.length; i++) {
      if (checkedList[i] === value) {
        return true;
      }
    }
    return false;
  }

  created() {
    this.formatter = new BusinessSearchModelFormatter<Role>();
    this.checkedCtrl = [];
    this.onCreated(
      this.roleAssignmentService,
      storage.resource(),
      storage.ui(),
      getLocale,
      showToast,
      alertError,
      storage.loading()
    );
  }

  mounted() {
    this.form = initForm(this.$refs.form, initMaterial);
    const s = this.mergeSearchModel(buildFromUrl(), ['ctrlStatus', 'userType']);
    this.init(s, storage.autoSearch);
  }

  add() {
    navigate(this.$router, "access-role-assignment/add");
  }

  view({roleId, cId}) {
    navigate(this.$router, "access-role-assignment", [roleId, cId]);
  }

  edit({roleId, cId}) {
    navigate(this.$router, "access-role-assignment/edit", [roleId, cId]);
  }

  approve({roleId, cId}) {
    navigate(this.$router, "access-role-assignment/approve", [roleId, cId]);
  }
}
</script>
<template>
  <div class='view-container'>
    <header>
      <h2>{{ resource.role_assignment_list }}</h2>
      <button type='button' class='btn-new' id='btnNew' @click='add'></button>
    </header>
    <div>
      <form id='accessRolesForm' name='accessRolesForm' noValidate='true' ref='form'>
        <section class='row search-group inline'>
          <label class='col s12 m6 l3'>
            {{ resource.role_name }}
            <input
              type='text'
              id='roleName'
              name='roleName'
              v-model='roleName'
              maxlength='240'
              :placeholder='resource.role_name'/>
          </label>
          <label class='col s12 m6 l3'>
            {{ resource.user_type }}
            <section class='checkbox-group' v-for='item of userTypes'>
              <label>
                <input type='checkbox'
                       :id='item.value'
                       name='userType'
                       :value='item.value'
                       :checked='isChecked(state.userType, item.value)'
                       @change='updateChecked(item.value, $event, "userType", checkedUserType, state)'/>
                {{ item.text }}
              </label>
            </section>
          </label>
          <label class='col s12 m6 l6'>
            {{ resource.ctrl_status }}
            <section class='checkbox-group' v-for='ctrlItem of ctrlStatuslist'>
              <label>
                <input type='checkbox' :id='ctrlItem.value' name='ctrlStatus' :value='ctrlItem.value'
                       :checked='isChecked(state["assignedCtrlStatus"], ctrlItem.value)'
                       @change='updateChecked(ctrlItem.value, $event, "assignedCtrlStatus", checkedCtrl, state)'/>
                {{ ctrlItem.text }}
              </label>
            </section>
          </label>
        </section>
        <section class='btn-group'>
          <label>
            {{ resource.page_size }}
            <select @change='onPageSizeChanged($event)'>
              <option v-for='p of pageSizes' :value='p' :selected='p === pageSize'>{{ p }}</option>
            </select>
          </label>
          <button type='submit' class='btn-search' @click='searchOnClick'>{{ resource.search }}</button>
        </section>
      </form>
      <form class='list-result'>
        <div class='table-responsive'>
          <table class='table table-striped table-bordered table-hover'>
            <thead>
            <tr>
              <th>{{ resource.sequence }}</th>
              <th data-field='roleId'>
                <button type='button' id='accessRoleId' @click='sort'>{{ resource.role_id }}</button>
              </th>
              <th data-field='role_name'>
                <button type='button' id='accessRoleName' @click='sort'>{{ resource.role_name }}</button>
              </th>
              <th data-field='ctrlStatus'>
                <button type='button' id='sortCtrlStatus' @click='sort'>{{ resource.ctrl_status }}</button>
              </th>
              <th data-field='actedBy'>
                <button type='button' id='sortActedBy' @click='sort'>{{ resource.acted_by }}</button>
              </th>
              <th data-field='actionDate'>
                <button type='button' id='sortActionDate' @click='sort'>{{ resource.action_date }}</button>
              </th>
              <th data-field='actionStatus'>
                <button type='button' id='sortActionStatus' @click='sort'>{{ resource.action_status }}</button>
              </th>
              <th class='action'>{{ resource.quick_action }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for='(accessRole, i) of list' :key="i">
              <td class='text-right'>{{ accessRole.sequenceNo }}</td>
              <td>{{ accessRole.roleId }}</td>
              <td>{{ accessRole.roleName }}</td>
              <td>{{ accessRole.ctrlStatus }}</td>
              <td>{{ accessRole.assignedBy }}</td>
              <td>{{ accessRole.assignedDate }}</td>
              <td>{{ accessRole.assignedStatus }}</td>
              <td>
                <div class='btn-group'>
                  <button v-if='viewable'
                          type='button'
                          class='btn-view'
                          :id="`btnApprove-${i}`"
                          @click='view(accessRole)'>
                  </button>
                  <button type='button' v-if='editable'
                          class='btn-edit'
                          id="`btnEdit-${i}`"
                          @click='edit(accessRole)'>
                  </button>
                  <button v-if="approvable && accessRole.ctrlStatus === 'P'"
                          type='button'
                          :id="`btnApprove-${i}`"
                          class='btn-approve'
                          @click='approve(accessRole)'></button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
          <div class='form-group col s12 m6 l6'>
            <paginateVue
              :items-per-page="pageSize"
              :item-total="itemTotal"
              :margin-pages="pageSize"
              :page-range="pageSize"
              :forcePage="pageIndex"
              :click-handler="pageChanged"
            ></paginateVue>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
