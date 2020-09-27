<script lang="ts">
import {Component} from 'vue-property-decorator';
import {buildId, EditComponent} from 'vue-onex';
import {applicationContext} from '../config/ApplicationContext';
import {alertError, confirm} from 'ui-alert';
import {showToast} from 'ui-toast';
import {getLocale, initForm, initMaterial, storage} from 'uione';
import {Role} from '../model/Role';
import Modal from './ModalComponent.vue';
import UsersLookup from './UsersLookup.vue';

@Component({
  components: {Modal, UsersLookup}
})
export default class RoleAssignmentComponent extends EditComponent<Role, any> {
  // this model save
  protected role: Role = new Role();

  protected availableUsers: any = [];
  protected roles: any = [];
  protected checkedCtrl: any = [];
  protected textSearch = '';
  protected isShowCheckbox = false;
  protected checkBoxList: any[] = [];
  protected userTypes = [];

  private roleAssignmentService = applicationContext.roleAssignmentService;
  private masterDataService = applicationContext.masterDataService;
  private apprAccessRoleAssignmentService = applicationContext.apprAccessRoleAssignmentService;

  created() {
    this.checkedCtrl = [];
    this.onCreated(
      this.roleAssignmentService,
      storage.resource(),
      storage.ui(),
      getLocale,
      showToast,
      alertError,
      confirm,
      storage.loading()
    );
    this.patchable = false;
  }

  mounted() {
    this.form = initForm(this.$refs.form, initMaterial);
    const id = buildId(this.service.keys(), this.$route);
    this.init(id);
  }

  init(id: any): void {
    Promise.all([
      this.masterDataService.getUserTypes(),
      this.apprAccessRoleAssignmentService.all()
    ]).then(state => {
      const [userTypeList, roles] = state;
      this.userTypes = userTypeList;
      this.roles = roles;
      this.load(id);
    }).catch(this.handleError);
  }

  onModelSave(data: { usersSelected }) {
    const {usersSelected} = data;
    if (usersSelected && Array.isArray(usersSelected)) {
      const users = this.availableUsers ? this.availableUsers : this.roles.users ? this.roles.users : [];
      usersSelected.forEach(item => {
        users.push(item);
      });
      this.availableUsers = users;
      this.role.users = users;
    }
  }

  updateChecked(value, event, checkedList) {
    if (event.target.checked) {
      checkedList.push(value);
    } else {
      for (let i = 0; i < checkedList.length; i++) {
        if (checkedList[i].userId === value.userId) {
          checkedList.splice(i, 1);
        }
      }
    }
  }

  isChecked(checkedList, value): boolean {
    if (checkedList === null || checkedList === undefined) {
      return false;
    }
    for (let i = 0; i < checkedList.length; i++) {
      if (checkedList[i].userId === value.userId) {
        return true;
      }
    }
    return false;
  }

  handleGroupdIdChange(event) {
    for (const item of this.roles) {
      const uType = this.role.userType;
      const users = this.role.users;
      if (item.roleId === event.target.value) {
        this.role = {...item, userType: uType};
      } else if (event.target.value === '') {
        this.role = {...this.role, userType: uType};
      }
    }

    this.availableUsers = this.role.users;
  }

  onSearch(event) {
    if (this.role.users) {
      const result = this.role.users.filter((value) => {
        return value['userId'].includes(event.target.value);
      });

      this.availableUsers = result;
    }
  }

  onShowCheckBox() {
    if (this.isShowCheckbox === false) {
      this.isShowCheckbox = true;
    } else {
      this.isShowCheckbox = false;
    }
  }

  onCheckAll() {
    if (this.checkBoxList) {
      this.checkBoxList = [];
    }
    if (this.role.users) {
      for (const user of this.role.users) {
        this.checkBoxList.push(user);
      }
    }
  }

  onUnCheckAll() {
    this.checkBoxList = [];
  }

  onDeleteCheckBox() {
    this.confirm('Delete ?', 'Delete', () => {
      const arr = [];
      this.role.users.map((value) => {
        const result = this.checkBoxList.find((v) => {
          if (v) {
            return v.userId === value.userId;
          }
        });
        if (result === undefined) {
          arr.push(value);
        }
      });
      this.availableUsers = arr;
      this.role.users = arr;
      this.checkBoxList = [];
      this.isShowCheckbox = false;
    });
  }

  public showModel(obj: Role) {
    this.role = obj;
    this.availableUsers = obj.users;
  }

}
</script>
<template>
  <div class='view-container'>
    <form id='accessRoleForm' name='accessRoleForm' model-name='accessRole' ref='form'>
      <header>
        <button type='button' class='btn-back' @click='back()'></button>
        <h2>{{ newMode ? resource.create : resource.edit }} {{ resource.role_assignment_subject }}</h2>
      </header>
      <div>
        <section class='row'>
          <h4>{{ resource.role_assignment_subject }}</h4>
          <label class='col s12 m6'>
            {{ resource.user_type }}
            <select id='userType' name='userType'
                    v-model="role.userType"
                    :value='role.userType'
                    @change="updateState" required>
              <option value=''>please select</option>
              <option v-for='item of userTypes' :value='item.value'>{{ item.text }}</option>
            </select>
          </label>
          <label class='col s12 m6'>
            {{ resource.role_id }}
            <select id='roleId' name='roleId'
                    v-model="role.roleId"
                    @change='handleGroupdIdChange($event)'
                    :value='role.roleId' :disabled="!newMode" required>
              <option value=''>please select</option>
              <option v-for='item of roles' :value='item.roleId'>{{ item.roleId }}</option>
            </select>
          </label>
          <label class='col s12 m6'>
            {{ resource.role_name }}
            <input type='text'
                   id='roleName' name='roleName'
                   maxlength='255'
                   :value='role.roleName'
                   :placeholder='resource.role_name'
                   :disabled="true"/>
          </label>
          <label class='col s12 m6'>
            {{ resource.description }}
            <input type='text'
                   id='roleDesc' name='roleDesc'
                   maxlength='255'
                   :value='role.roleDesc'
                   :placeholder='resource.description'
                   :disabled="true"/>
          </label>
        </section>
        <section class='row detail'>
          <h4>
            {{ resource.role_subject }}
            <div class='btn-group'>
              <button v-if='editable' type='button' @click='$refs.reuseModal.open()'>{{ resource.add }}</button>
              <button v-if='editable' type='button' @click='onShowCheckBox'>
                {{ isShowCheckbox ? resource.deselect : resource.select }}
              </button>
              <button v-if='isShowCheckbox' type='button' @click='onCheckAll'>{{ resource.check_all }}</button>
              <button v-if='isShowCheckbox' type='button' @click='onUnCheckAll'>{{ resource.uncheck_all }}</button>
              <button v-if='isShowCheckbox' type='button' @click='onDeleteCheckBox'>{{ resource.delete }}</button>
            </div>
          </h4>
          <label class='col s12 search-input'>
            <i class='btn-search'></i>
            <input type='text' id='textSearch' name='textSearch'
                   :v-model='textSearch'
                   :placeholder='resource.role_assignment_search_user' v-on:keyup="onSearch"/>
          </label>
          <ul class='row list-view'>
            <li class='col s12 m6 l4 xl3' v-for='value of availableUsers'>
              <section>
                <input v-if="isShowCheckbox" type='checkbox' name='selected' :value='value'
                       :checked='isChecked(checkBoxList, value)' @change='updateChecked(value,$event,checkBoxList)'/>
                <template v-if='value.gender === "M"'>
                  <img class='round-border' src="@/assets/images/male.png"/>
                </template>
                <template v-else>
                  <img class='round-border' src="@/assets/images/female.png"/>
                </template>
                <div>
                  <h3>{{ value.userId }}</h3>
                  <p>{{ value.firstName }} {{ value.lastName }}</p>
                </div>
                <button class='btn-detail'/>
              </section>
            </li>
          </ul>
        </section>
      </div>
      <Modal ref="reuseModal" role="dialog">
        <template v-slot:header>
          <header class='modal-portal-header'>
            <h2>{{ resource.user_list }}</h2>
            <button id='btnClose' name='btnClose' class='btn-close' @click='$refs.reuseModal.close()'></button>
          </header>
        </template>
        <template v-slot:body>
          <UsersLookup
            :assignedUsers="availableUsers"
            v-on:closeModalFn="$refs.reuseModal.close"
            v-on:onSave="onModelSave">
          </UsersLookup>
        </template>
      </Modal>
      <footer>
        <button type='submit' class='btn btn-primary' id='btnSave' name='btnSave' @click='saveOnClick'>
          {{ resource.save }}
        </button>
      </footer>
    </form>

  </div>
</template>
