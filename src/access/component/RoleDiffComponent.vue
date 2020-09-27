<script lang="ts">
import {Component} from "vue-property-decorator";
import {applicationContext} from "../config/ApplicationContext";
import {alertError} from "ui-alert";
import {showToast} from "ui-toast";
import {initForm, initMaterial, storage} from "uione";
import {buildId, DiffApprComponent} from "vue-onex";
import {Role} from '../model/Role';

@Component
export default class RoleDiffComponent extends DiffApprComponent<Role, any> {
  private renderFields = [
    {resourceKey: 'user_type', name: 'userType'},
    {resourceKey: 'role_id', name: 'roleId'},
    {resourceKey: 'role_name', name: 'roleName'},
    {resourceKey: 'description', name: 'roleDesc'},
    {resourceKey: 'role_modules_assign_to_role', name: 'modules', 'label': 'moduleName'},
  ];

  created() {
    this.onCreated(
      applicationContext.roleService,
      storage.resource(),
      storage.getLocale,
      showToast,
      alertError,
      storage.loading()
    );
  }

  mounted() {
    this.form = initForm(this.$refs.form, initMaterial);
    const id: any = buildId(this.service.keys(), this.$route);
    this.load(id);
  }
}
</script>
<template>
  <div class='view-container'>
    <form id='accessRoleForm' name='accessRoleForm' ref='form'>
      <header>
        <button type='button' class='btn-back' @click='back'></button>
        <h2>{{ resource.role_subject }}</h2>
      </header>
      <div class='diff'>
        <h4>
          <span>{{ resource.field }}</span>
          <span>{{ resource.old_data_subject }}</span>
          <span>{{ resource.new_data_subject }}</span>
        </h4>
        <p v-for='item of renderFields' :class="item.name">
          <label style="color: #999999">{{ resource[item.resourceKey] }}</label>
          <span v-if="!item.hasOwnProperty('label')">{{ origin[item.name] }} </span>
          <span v-if="!item.hasOwnProperty('label')">{{ value[item.name] }} </span>
          <template v-if="item.hasOwnProperty('label')">
            <ul>
              <li v-for='module of origin[item.name]'>{{ module[item.label] }}</li>
            </ul>
            <ul>
              <li v-for='module of value[item.name]'>{{ module[item.label] }}</li>
            </ul>
          </template>
        </p>
      </div>
      <footer>
        <button type='submit' id='btnApprove' name='btnApprove' @click='approve($event)' :disabled ='disabled'>
          {{ resource.approve }}
        </button>
        <button type='button' id='btnReject' name='btnReject' @click='reject($event)' :disabled='disabled'>
          {{ resource.reject }}
        </button>
      </footer>
    </form>
  </div>
</template>
