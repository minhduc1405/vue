<script lang="ts">
import { Component } from "vue-property-decorator";
import { applicationContext } from "../config/ApplicationContext";
import { alertError } from "ui-alert";
import { showToast } from "ui-toast";
import { initForm, initMaterial } from "uione";
import { DiffApprComponent } from "vue-onex";
import { buildId } from "vue-onex";
import { storage } from "uione";
import {User} from "../model/User";
import moment from "moment";

@Component
export default class UserDiffComponent extends DiffApprComponent<User, any> {
  renderFields = [
    {resourceKey: 'user_id', name: 'userId'},
    {resourceKey: 'staff_id', name: 'staffId'},
    {resourceKey: 'first_name', name: 'firstName'},
    {resourceKey: 'last_name', name: 'lastName'},
    {resourceKey: 'person_title', name: 'title'},
    {resourceKey: 'gender', name: 'gender'},
    {resourceKey: 'position', name: 'pos'},
    {resourceKey: 'phone', name: 'telephone'},
    {resourceKey: 'email', name: 'email'},
    {resourceKey: 'group', name: 'groupId'},
    {resourceKey: 'user_access_date_from', name: 'accessDateFrom'},
    {resourceKey: 'user_access_date_to', name: 'accessDateTo'},
    {resourceKey: 'user_access_time_from', name: 'accessTimeFrom'},
    {resourceKey: 'user_access_time_to', name: 'accessTimeTo'},
  ];


  formatFields(value) {
    const dateFormat = storage.getDateFormat();
    const resource = this.resource;
    const gender = value && value.gender === 'M' ? resource.male : resource.female ;
    const roleType = value && value.roleType === 'M' ? resource.role_type_operator : resource.role_type_approver ;
    const pos = value.pos === 'E' ? resource.position_employee : (value.pos === 'M' ? resource.position_manager : resource.position_director);
    const activate = value.activate === 'T' ? resource.true : resource.false;
    const accessDateFrom = moment(value.accessDateFrom).format(dateFormat);
    const accessDateTo = moment(value.accessDateTo).format(dateFormat);
    return {...value, gender, roleType, pos, activate, accessDateFrom, accessDateTo};
  }

  created() {
    this.onCreated(
      applicationContext.userService,
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
  <div class="view-container">
    <form id="userDiffForm" name="userDiffForm" ref="form">
      <header>
        <button type="button" id="btnBack" name="btnBack" class="btn-back" @click="back" />
        <h2>{{resource.user}}</h2>
      </header>
      <div class="diff">
        <h4>
          <span>{{resource.field}}</span>
          <span>{{resource.old_data_subject}}</span>
          <span>{{resource.new_data_subject}}</span>
        </h4>
        <hr />
        <p v-for="(item, i) in renderFields" :key="i" :class="item.name">
          <label>{{resource[item.resourceKey]}}</label>
          <span>{{origin[item.name]}}</span>
          <span>{{value[item.name]}}</span>
        </p>
      </div>
      <footer>
        <button
          type="submit"
          id="btnApprove"
          name="btnApprove"
          @click="approve"
          :disabled="disabled"
        >{{resource.approve}}</button>
        <button
          type="button"
          id="btnReject"
          name="btnReject"
          @click="reject"
          :disabled="disabled"
        >{{resource.reject}}</button>
      </footer>
    </form>
  </div>
</template>
