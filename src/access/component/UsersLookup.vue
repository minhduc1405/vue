<script lang="ts">
import {Component, Prop} from 'vue-property-decorator';
import {getLocale, initForm, initMaterial, storage} from 'uione';
import {User} from "../model/User";
import PaginateVue from "../../core/PaginateVue.vue";
import {SearchComponent} from 'vue-onex';
import {UserSM} from "../search-model/UserSM";
import {BusinessSearchModelFormatter} from "../config/BusinessSearchModelFormatter";
import {showToast} from "ui-toast";
import {alertError} from "ui-alert";
import {applicationContext} from "../config/ApplicationContext";

@Component({
  name: 'UsersLookup',
  components: {PaginateVue}
})
export default class UsersLookup extends SearchComponent<User, UserSM> {
  protected users: User[] = [];
  protected userId: string = '';
  @Prop({required: true}) assignedUsers: User[] = [];
  private userService = applicationContext.userService;

  get roleAssignToUsersData() {
    return this.assignedUsers;
  }

  get hidden() {
    return !this.userId;
  }

  created() {
    this.formatter = new BusinessSearchModelFormatter<User>();
    this.onCreated(
      this.userService,
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
    this.load(this.createSearchModel(), storage.autoSearch);
  }

  createSearchModel(): UserSM {
    const obj: any = {};
    return obj;
  }

  onCheckUser(event: any): void {
    if (event.target.checked) {
      const result = this.getList().find((value) => value.userId === event.target.value);
      this.users.push(result);
    } else {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].userId === event.target.value) {
          this.users.splice(i, 1);
        }
      }
    }
  }

  onModelSave(e) {
    e.preventDefault();
    this.$emit('onSave', {usersSelected: this.users});
    this.users = [];
    this.$emit('closeModalFn', {});
  }

  existInArray(list: Array<Object>, itemSelect: any, fieldName: string) {
    return list.some((item) => {
      return item && itemSelect && item[fieldName] === itemSelect[fieldName];
    });
  }

  protected clearUserId = (e) => {
    e.preventDefault();
    this.userId = '';
  }

  onSearch(event) {
    if (this.getList()) {
      const result = this.getList().filter((value) => {
        return value['userId'].includes(event.target.value);
      });
      this.setList(result);
    }
  }
}
</script>
<template>
  <div class='view-container'>
    <div>
      <form id='usersForm' name='usersForm' novalidate result-view='view2'>
        <section class='row search-group'>
          <label class='col s12 m6 search-input'>
            <select @change='onPageSizeChanged($event)'>
              <option v-for='p of pageSizes' :value='p' :selected='p === pageSize'>{{ p }}</option>
            </select>

            <input type='text' id='userId' name='userId' maxlength='255' v-model='userId'
                   :placeholder="resource.user_id"/>
            <button type='button' :hidden='hidden' class='btn-remove-text' @click='clearUserId($event)'></button>
            <button type='submit' class='btn-search' @click='searchOnClick($event)'></button>
          </label>
          <paginateVue
            :items-per-page="pageSize"
            :item-total="itemTotal"
            :margin-pages="pageSize"
            :page-range="pageSize"
            :forcePage="pageIndex"
            :click-handler="pageChanged"
          ></paginateVue>
        </section>
      </form>
      <form class='list-result'>
        <div class='table-responsive'>
          <table>
            <thead>
            <tr>
              <th>{{ resource.sequence }}</th>
              <th data-field='userId'><a id='sortUserId' @click='sort($event)'>{{ resource.user_id }}</a></th>
              <th data-field='roleType'><a id='sortRoleType' @click='sort($event)'>{{ resource.role_type }}</a></th>
              <th data-field='activate'><a id='sortActivate' @click='sort($event)'>{{ resource.activation_status }}</a>
              </th>
              <th data-field='ctrlStatus'><a id='sortCtrlStatus' @click='sort($event)'>{{ resource.ctrl_status }}</a>
              </th>
              <th data-field='actedBy'><a id='sortActedBy' @click='sort($event)'>{{ resource.acted_by }}</a></th>
              <th data-field='actionDate'><a id='sortActionDate' @click='sort($event)'>{{ resource.action_date }}</a>
              </th>
              <th data-field='actionStatus'><a id='sortActionStatus'
                                               @click='sort($event)'>{{ resource.action_status }}</a>
              </th>
              <th class='action'>{{ resource.quick_action }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(user,i) of list" :key='i'>
              <template v-if="!existInArray(roleAssignToUsersData, user, 'userId')">
                <td class='text-right'>{{ user.sequenceNo }}</td>
                <td>{{ user.userId }}</td>
                <td>{{ user.roleType === 'A' ? 'Approver' : 'Operator' }}</td>
                <td>{{ user.activate === 'T' ? 'Activated' : 'Deactivated' }}</td>
                <td>{{
                    user.ctrlStatus === 'A' ? 'Approved' : (user.ctrlStatus === 'P' ? 'Pending' :
                      'Rejected')
                  }}
                </td>
                <td>{{ user.actedBy }}</td>
                <td>{{ user.actionDate }}</td>
                <td>{{ user.actionStatus === 'C' ? 'Create' : 'Update' }}</td>
                <td>
                  <label>
                    <input type='checkbox' :value='user.userId' @click='onCheckUser($event)'/>
                  </label>
                </td>
              </template>
            </tr>
            </tbody>
          </table>
        </div>
      </form>
    </div>
    <footer>
      <button type='submit' @click='onModelSave'>{{ resource.select }}</button>
    </footer>
  </div>
</template>
