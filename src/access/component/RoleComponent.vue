<script lang="ts">
import {Component} from 'vue-property-decorator';
import {buildId, EditComponent} from 'vue-onex';
import {applicationContext} from '../config/ApplicationContext';
import {alertError, confirm} from 'ui-alert';
import {showToast} from 'ui-toast';
import {getLocale, initForm, initMaterial, storage} from 'uione';
import {Role} from '../model/Role';
import {Module} from '../model/Module';
import {User} from '../model/User';

@Component
export default class RoleComponent extends EditComponent<Role, any> {
  ctrlStatuslist = [];

  public role: Role = new Role();
  public moduleList: Array<Module> = new Array<Module>();
  public availableModules: Array<Module> = new Array<Module>();
  public showModules: Array<Module> = [];
  public userList: Array<User> = [];
  public checkedAll = false;
  public keyword: string;
  protected userTypeList = [];

  checkedCtrl: string[] = [];
  private roleService = applicationContext.roleService;
  private masterDataService = applicationContext.masterDataService;
  private accessModuleService = applicationContext.moduleService;
  private userService = applicationContext.userService;

  created() {
    this.checkedCtrl = [];
    this.onCreated(
      this.roleService,
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
      this.accessModuleService.all(),
      this.userService.all()
    ]).then(response => {
      const [userTypeList, moduleList, userList] = response;
      this.userTypeList = userTypeList;
      this.moduleList = this.availableModules = this.showModules = moduleList as Array<Module>;
      this.role.modules = this.availableModules = moduleList as Module[];
      this.userList = userList;
      this.load(id);
    }).catch(this.handleError);
  }

  showModel(model: Role) {
    this.role = model;
    const availableModules = this.availableModules;
    const lenAv = availableModules.reduce((len, modules) => len += modules.children.length, 0);
    this.checkedAll = this.role.modules && this.role.modules.length === lenAv;
  }

  onChangekeyword(event) {
    const keyword = event.target.value;
    if (keyword === '') {
      this.keyword = keyword;
      this.showModules = this.availableModules;
    } else {
      this.keyword = keyword;
      this.showModules = this.availableModules.map(parent => {
        const parentCopy = Object.assign({}, parent);
        parentCopy.children = parentCopy.children.filter(son => son.moduleName.toLowerCase().includes(keyword.toLowerCase()));
        return parentCopy;
      }).filter(item => item.children.length > 0);
    }
  }

  checkItem(modules, module, fieldName1, fieldName2, isParent?: boolean) {
    if (isParent) {
      const children = this.availableModules.find(item => item.moduleId === module.moduleId).children;
      return modules && children ? (modules.filter(item => item.parentId === module.moduleId).length === children.length) : false;
    } else {
      return modules ? (modules.some(item => item[fieldName1] === module[fieldName2])) : false;
    }
  }

  handleCheck(event) {
    const availableModules = this.availableModules;
    if (event.target.value === 'on') {
      const parent = availableModules.find(item => item.moduleId === event.target.id);
      if (this.role.modules.filter(item => item.parentId === event.target.id).length === parent.children.length) {
        this.role.modules = this.role.modules.filter(item => item.parentId !== event.target.id);
      } else {
        this.role.modules = this.role.modules.filter(item =>
          item.parentId !== event.target.id);
        this.role.modules = this.role.modules.concat(parent.children);
      }
    } else if (event.target.value === 'all') {
      if (event.target.checked) {
        this.role.modules = availableModules.reduce((resultArray, currentArray) => resultArray.concat(currentArray.children), []);
      } else {
        this.role.modules = [];
      }
    } else {
      let checked = true;
      const parentModule = availableModules.find(item =>
        item.moduleId === event.target.value);
      const child = parentModule.children.find(value =>
        value.moduleId === event.target.id);
      if (this.role.modules && this.role.modules.length > 0) {
        checked = !!this.role.modules.find(item =>
          item.moduleId === event.target.id);
      } else {
        checked = false;
      }
      if (!checked && this.role.modules) {
        this.role.modules.push(child);
      } else {
        this.role.modules = this.role.modules.filter(item => item.moduleId !== event.target.id);
      }
    }
    this.isCheckedAll(event);
  }

  isCheckedAll(event) {
    const lenAv = this.availableModules.reduce((len, modules) => len += modules.children.length, 0);
    this.checkedAll = this.role.modules && this.role.modules.length === lenAv;
  }
}
</script>
<template>
  <div class='view-container'>
    <form id='accessRoleForm' name='accessRoleForm' class='form' ref="form" novalidate>
      <header>
        <button type='button' class='btn-back' @click='back'></button>
        <h2>{{ newMode ? resource.create : resource.edit }} {{ resource.role_subject }}</h2>
        <h2>{{ resource.role }}</h2>
      </header>
      <div>
        <section class='row'>
          <label class='col s12 m6'>
            {{ resource.user_type }}
            <select
              id='userType'
              name='userType'
              class='form-control'
              v-model='role.userType'
              required>
              <option value=''>Please Select</option>
              <option v-for='item of userTypeList' :value='item.value'>{{ item.text }}</option>
            </select>
          </label>
          <label class='col s12 m6'>
            {{ resource.role_id }}
            <input type='text' id='roleId' name='roleId'
                   v-model='role.roleId'
                   :placeholder='resource.role_id'
                   maxlength='255' required>
          </label>
          <label class='col s12 m6'>
            {{ resource.role_name }}
            <input type='text' id='roleName' name='roleName'
                   v-model='role.roleName'
                   :placeholder='resource.role_name'
                   maxlength='255' required>
          </label>
          <label class='col s12 m6'>
            {{ resource.description }}
            <input type='text' id='roleDesc' name='roleDesc'
                   v-model='role.roleDesc'
                   :placeholder='resource.description' required>
          </label>
        </section>
        <h4>
          <label>
            <input
              type='checkbox'
              value='all'
              name='moduleId'
              :checked='checkedAll'
              @change='handleCheck'
            />
            {{ resource.all_modules }}
          </label>
          <label class='col s12 search-input'>
            <i class='btn-search'></i>
            <input type='text'
                   id='keyword'
                   name='keyword'
                   maxLength='40'
                   :placeholder='resource.role_filter_modules'
                   v-on:keyup='onChangekeyword'/>
          </label>
        </h4>
        <section class='row'>
          <section class='col s12'>
            <template v-for='item of showModules'>
              <label class='checkbox-container'>
                {{ item.moduleName }}
                <input
                  type='checkbox'
                  :id='item.moduleId'
                  :name='item.moduleId'
                  :checked="checkItem(role.modules, item, 'parentId', 'moduleId', true)"
                  @change='handleCheck($event)'
                />

              </label>
              <section class='row checkbox-group'>
                <label class="col s6 m4 l3" v-for='child of item.children'>
                  {{ child.moduleName }}
                  <input
                    type='checkbox'
                    :value='child.parentId'
                    :id='child.moduleId'
                    :checked="checkItem(role.modules, child, 'moduleId', 'moduleId')"
                    :name='child.moduleId'
                    @change='handleCheck($event)'
                  />
                </label>
                <hr/>
              </section>
            </template>
          </section>
        </section>
      </div>
      <footer>
        <button type='submit' class='btn btn-primary' id='btnSave' name='btnSave' @click='saveOnClick'>
          {{ resource.save }}
        </button>
      </footer>
    </form>
  </div>
</template>
