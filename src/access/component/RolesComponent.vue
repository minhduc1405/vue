<script lang="ts">
import {alertError} from "ui-alert";
import {showToast} from "ui-toast";
import {getLocale, initForm, initMaterial, storage} from "uione";
import {buildFromUrl, navigate, SearchComponent} from "vue-onex";
import {applicationContext} from "../config/ApplicationContext";
import Component from "vue-class-component";
import PaginateVue from "../../core/PaginateVue.vue";
import {Role} from "../model/Role";
import {RoleSM} from "../search-model/RoleSM";

@Component({
  components: {PaginateVue}
})
export default class RolesComponent extends SearchComponent<Role, RoleSM> {
  // init model search
  roleName = '';
  userType = [];
  ctrlStatus = [];

  public userTypeList = [];
  public ctrlStatusList = [];

  checkedCtrl: string[] = [];
  private roleService = applicationContext.roleService;
  private masterDataService = applicationContext.masterDataService;

  created() {
    this.formatter = applicationContext.businessSearchModelFormatter;
    this.checkedCtrl = [];
    this.onCreated(
      this.roleService,
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

  init(s: RoleSM, auto: boolean) {
    Promise.all([
      this.masterDataService.getUserTypes(),
      this.masterDataService.getCtrlStatus()
    ]).then(response => {
      const [userTypeList, ctrlStatusList] = response;
      this.ctrlStatusList = ctrlStatusList;
      this.userTypeList = userTypeList;
      this.load(s, auto);
    }).catch(this.handleError);
  }

  add() {
    navigate(this.$router, "access-role-definition/add");
  }

  view({roleId, cId}) {
    navigate(this.$router, "access-role-definition", [roleId, cId]);
  }

  edit({roleId, cId}) {
    navigate(this.$router, "access-role-definition/edit", [roleId, cId]);
  }

  approve({roleId, cId}) {
    navigate(this.$router, "access-role-definition/approve", [roleId, cId]);
  }
}
</script>
<template>
  <div class='view-container'>
    <header>
      <h2>{{ resource.role_list }}</h2>
      <button type='button' class='btn-new' id='btnNew' @click='add'></button>
    </header>
    <div class='view-body'>
      <form id='rolesForm' name='rolesForm' novalidate result-view='view2'>
        <section class='row search-group inline'>
          <label class='col s12 m6'>
            {{ resource.role_name }}
            <input type='text' id='roleName' name='roleName' maxlength='240' v-model='roleName'/>
          </label>
          <label class='col s12 m3'>
            {{ resource.user_type }}
            <section class='checkbox-group'>
              <label v-for='item of userTypeList'>
                <input
                  :id='`userType-${item.value}`'
                  type='checkbox'
                  name='userType'
                  :value = "item.value"
                  v-model='userType'
                />
                {{ item.text }}
              </label>
            </section>
          </label>
          <label class='col s12 m3'>
            {{ resource.ctrl_status }}
            <section class='checkbox-group'>
              <label v-for='item of ctrlStatusList'>
                <input
                  :id='item.value'
                  type='checkbox'
                  name='ctrlStatus'
                  :value = "item.value"
                  @change="updateState"
                  v-model='ctrlStatus'
                />
                {{ item.text }}
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
          <button id='btnSearch' type='submit' class='btn-search' @click='searchOnClick($event)'>
            {{ resource.search }}
          </button>
        </section>
      </form>
      <form class='list-result'>
        <div class='table-responsive'>
          <table class='table table-striped table-bordered table-hover'>
            <thead>
            <tr>
              <th data-field='roleId'><a id='sortRoleId' @click='sort($event)'>{{ resource.role_id }}</a></th>
              <th data-field='roleName'><a id='sortRoleName' @click='sort($event)'>{{ resource.role_name }}</a></th>
              <th data-field='ctrlStatus'><a id='sortCtrlStatus' @click='sort($event)'>{{ resource.ctrl_status }}</a>
              </th>
              <th data-field='actedBy'><a id='sortActedBy' @click='sort($event)'>{{ resource.acted_by }}</a></th>
              <th data-field='actionDate'><a id='sortActionDate' @click='sort($event)'>{{ resource.action_date }}</a>
              </th>
              <th data-field='actionDate'><a id='sortActionStatus'
                                             @click='sort($event)'>{{ resource.action_status }}</a></th>
              <th class='col-action'><a>{{ resource.action }}</a></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for='(accessRole, i) of list' :key="i">
              <td>{{ accessRole.roleId }}</td>
              <td>{{ accessRole.roleName }}</td>
              <td>{{ accessRole.ctrlStatus }}</td>
              <td>{{ accessRole.actedBy }}</td>
              <td>{{ accessRole.actionDate }}</td>
              <td>{{ accessRole.actionStatus }}</td>
              <td class='col-action'>
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
        </div>
      </form>
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
  </div>
</template>
