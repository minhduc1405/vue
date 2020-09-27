<script lang="ts">
  import {alertError} from "ui-alert";
  import {showToast} from "ui-toast";
  import {getLocale, initForm, initMaterial, storage} from "uione";
  import {buildFromUrl, navigate, SearchComponent} from "vue-onex";
  import {applicationContext} from "../config/ApplicationContext";
  import Component from "vue-class-component";
  import PaginateVue from "../../core/PaginateVue.vue";
  import {User} from "../model/User";
  import {UserSM} from "../search-model/UserSM";

  @Component({
    components: {PaginateVue}
  })
  export default class UsersComponent extends SearchComponent<User, UserSM> {
    userId: string = "";
    activate: any;
    ctrlStatus = [];

    checkedCtrl: string[] = [];
    activationStatusList: any = [];
    ctrlStatusList: any = [];
    private payerService = applicationContext.userService;
    private masterDataService = applicationContext.masterDataService;

    created() {
      this.formatter = applicationContext.businessSearchModelFormatter;
      this.checkedCtrl = [];
      this.onCreated(
        this.payerService,
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
      const s = this.mergeSearchModel(buildFromUrl(), ['ctrlStatus', 'activate']);
      this.init(s, true);
    }

    init(s: UserSM, auto: boolean) {
      Promise.all([
        this.masterDataService.getStatus(),
        this.masterDataService.getCtrlStatus()
      ]).then(values => {
        const [activationStatusList, ctrlStatusList] = values;
        this.activationStatusList = activationStatusList;
        this.ctrlStatusList = ctrlStatusList;
        this.load(s, auto)
      }).catch(this.handleError);
    }

    includes(checkedList: any[], v: string | number): boolean {
      return v && checkedList && Array.isArray(checkedList) ? checkedList.indexOf(v) >= 0 : false;
    }

    add() {
      const url = this.$router['history'].current.fullPath;
      navigate(this.$router, url, ['add']);
    }

    view(id: string) {
      navigate(this.$router, "/access/users/", [id]);
    }

    edit = (id: string) => {
      navigate(this.$router, "/access/users/edit", [id]);
    }

    approve = (id: string) => {
      navigate(this.$router, "/access/users/approve", [id]);
    }
  }
</script>
<template>
  <div class='view-container'>
    <header>
      <h2>{{resource.users}}</h2>
      <button type='button' class='btn-new' id='btnNew' @click='add'></button>
    </header>
    <div>
      <form id='usersForm' name='usersForm' novalidate result-view='view2'>
        <section class='row search-group inline'>
          <label class='col s12 m4 l3'>
            {{resource.user_id}}
            <input type='text' id='userId' name='userId' v-model='userId' maxlength='255'
                   :placeholder='resource.user_id'/>
          </label>
          <label class='col s12 m8 l4 checkbox-section'>
            {{resource.activation_status}}
                        <section class='checkbox-group'>
                          <label v-for='item of activationStatusList'>
                            <input type='checkbox' name='activate'
                                   :checked="includes(activate,item.value)"
                                   @change='updateState($event)'/> {{item.text}}
                          </label>
                        </section>
          </label>
          <label class='col s12 m12 l5'>
            {{resource.ctrl_status}}
            <section class='checkbox-group'>
              <label v-for='item of ctrlStatusList'>
                <input type='checkbox' :id='item.value' name='ctrlStatus' :value='item.value'
                       :checked="includes(ctrlStatus,item.value)"
                       @change='updateState($event)'/>
                {{item.text}}
              </label>
            </section>
          </label>
        </section>
        <section class='btn-group'>
          <label>
            {{resource.page_size}}
            <select @change="onPageSizeChanged">
              <option v-for="p of pageSizes" :value="p" :selected="p === pageSize" :key="p">{{p}}</option>
            </select>
          </label>
          <button id='btnSearch' type='submit' class='btn-search' @click='searchOnClick($event)'>{{resource.search}}
          </button>
        </section>
      </form>
      <form class='list-result'>
        <div class='table-responsive'>
          <table>
            <thead>
            <tr>
              <th>{{resource.sequence}}</th>
              <th data-field='userId'>
                <a id='sortUserId' @click={sort}>{{resource.user_id}}</a>
              </th>
              <th data-field='roleType'>
                <a id='sortRoleType' @click={sort}>{{resource.role_type}}</a>
              </th>
              <th data-field='activate'>
                <a id='sortActivate' @click={sort}>{{resource.activation_status}}</a>
              </th>
              <th data-field='ctrlStatus'>
                <a id='sortCtrlStatus' @click={sort}>{{resource.ctrl_status}}</a>
              </th>
              <th data-field='actedBy'>
                <a id='sortActedBy' @click={sort}>{{resource.acted_by}}</a>
              </th>
              <th data-field='actionDate'>
                <a id='sortActionDate' @click={sort}>{{resource.action_date}}</a>
              </th>
              <th data-field='actionStatus'>
                <a id='sortActionStatus' @click={sort}>{{resource.action_status}}</a>
              </th>
              <th class='action'>{{resource.quick_action}}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(user, i) of list">
              <td class='text-right'>{{user.sequenceNo}}</td>
              <td>{{user.userId}}</td>
              <td>{{user.roleType}}</td>
              <td>{{user.activate}}</td>
              <td>{{user.ctrlStatus}}</td>
              <td>{{user.actedBy}}</td>
              <td>{{user.actionDate}}</td>
              <td>{{user.actionStatus}}</td>
              <td class='col-action'>
                <div class='btn-group'>
                  <button type='button' class='btn-edit' v-if='viewable && !editable' :id='`btnView${i}`'
                          @click='view(user.userId)'></button>
                  <button type='button' v-if='editable' class='btn-edit' :id='`btnEdit{i}`'
                          @click='edit(user.userId)'></button>
                  <button v-if="user && user.ctrlStatus === 'P'" type='button' :id='`btnApprove{i}`'
                          class='btn-approve' @click='approve(user.userId)'></button>
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
              :page-class="'page-item'"
              :pageLinkClass="'page-link'"
              :container-class="'pagination'"
            ></paginateVue>
          </div>
        </div>
      </form>
    </div>
  </div>

</template>
