<script lang="ts">
  import {Component} from "vue-property-decorator";
  import {buildId, EditComponent} from "vue-onex";
  import {applicationContext} from "../config/ApplicationContext";
  import {alertError, confirm} from 'ui-alert';
  import {showToast} from 'ui-toast';
  import {
    storage,
    initForm,
    initMaterial,
    getLocale
  } from "uione";
  import {User} from "../model/User";
  import {ModelStatus} from "../enum/ModelStatus";
  import {RoleType} from "../enum/RoleType";
  import {Gender} from "../enum/Gender";

  @Component
  export default class UserComponent extends EditComponent<User, any> {
    checkedCtrl: string[] = [];
    user: any = {};
    titleList: any = [];
    positionList: any = [];
    private payerService = applicationContext.userService;
    private masterDataService = applicationContext.masterDataService;

    created() {
      this.checkedCtrl = [];
      this.onCreated(
        this.payerService,
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

    init(id: number): void {
      Promise.all([
        this.masterDataService.getTitles(),
        this.masterDataService.getPositions(),
        this.masterDataService.getGenders()
      ]).then(vvv => {
        const [titleList, positionList] = vvv;
        this.titleList = titleList;
        this.positionList = positionList;
        this.load(id);
      }).catch(this.handleError);
    }

    protected user: User = new User();

    createModel(): User {
      const user = super.createModel();
      user.activate = ModelStatus.Activated;
      user.roleType = RoleType.Operator;
      user.accessTimeFrom = '00:00';
      user.accessTimeTo = '00:00';
      delete user.createdDate;
      return user;
    }

    loadGender(user?: User) {
      user = user === undefined ? this.user : user;
      if (user.title === 'Mr') {
        this.user = {...user, gender: Gender.Male};
      } else {
        this.user = {...user, gender: Gender.Female};
      }
    }
  }
</script>
<template>
<!--  <div class='view-container'>-->
<!--    <form id='userForm' name='userForm' class='form' novalidate>-->
<!--      <header class='view-header'>-->
<!--        <button type='button' class='btn-back' @click='back'></button>-->
<!--        <h2>{{newMode ? resource.create : resource.edit}} {{resource.user}}</h2>-->
<!--      </header>-->
<!--      <div>-->
<!--        <section class='row'>-->
<!--          <label class='col s12 m6'>-->
<!--            {{resource.user_id}}-->
<!--            <input-->
<!--              type='text'-->
<!--              id='userId'-->
<!--              name='userId'-->
<!--              v-model='user.userId'-->
<!--              :placeholder='resource.user_id'-->
<!--              onblur='requiredOnBlur' required/>-->
<!--          </label>-->
<!--          <label class='col s12 m6'>-->
<!--            {{resource.staff_id}}-->
<!--            <input-->
<!--              type='text'-->
<!--              id='staffId'-->
<!--              name='staffId'-->
<!--              v-model='user.staffId'-->
<!--              :placeholder='resource.staff_id'-->
<!--              onblur='requiredOnBlur' required/>-->
<!--          </label>-->
<!--          <label class='col s12 m6'>-->
<!--            {{resource.first_name}}-->
<!--            <input-->
<!--              type='text'-->
<!--              id='firstName'-->
<!--              name='firstName'-->
<!--              v-model='user.firstName'-->
<!--              :placeholder='resource.first_name'-->
<!--              onblur='requiredOnBlur' required/>-->
<!--          </label>-->
<!--          <label class='col s12 m6'>-->
<!--            {{resource.last_name}}-->
<!--            <input-->
<!--              type='text'-->
<!--              id='lastName'-->
<!--              name='lastName'-->
<!--              v-model='user.lastName'-->
<!--              :placeholder='resource.last_name'-->
<!--              onblur='requiredOnBlur' required/>-->
<!--          </label>-->
<!--          <label class='col s12 m6'>-->
<!--            {{resource.person_title}}-->
<!--            <select-->
<!--              id='title'-->
<!--              name='title'-->
<!--              v-model='user.title'-->
<!--              v-on:change="loadGender"-->
<!--            >-->
<!--              <option :selected='true' value=''>{{resource.please_select}}</option>-->
<!--              <option v-for="(item, index) of titleList" :key='index' :value='item.value'>{{item.text}}</option>-->
<!--            </select>-->
<!--          </label>-->
<!--          <label class='col s12 m6'>-->
<!--            {{resource.gender}}-->
<!--            <div class='radio-group'>-->
<!--              <label>-->
<!--                <input type='radio' id='genderM' name='gender' value='M' v-model='user.gender'>-->
<!--                {{resource.male}}-->
<!--              </label>-->
<!--              <label>-->
<!--                <input type='radio' id='genderF' name='gender' value='F' v-model='user.gender'>-->
<!--                {{resource.female}}-->
<!--              </label>-->
<!--            </div>-->
<!--          </label>-->
<!--          <label class='col s12 m12'>-->
<!--            {{resource.position}}-->
<!--            <select-->
<!--              id='pos'-->
<!--              name='pos'-->
<!--              v-model='user.pos'-->
<!--            >-->
<!--              <option selected={true} value=''>{{resource.please_select}}</option>-->
<!--              <option *ngFor="let item of positionList;let i = index" key={index} value={{item.value}}>{{item.text}}-->
<!--              </option>-->
<!--            </select>-->
<!--          </label>-->
<!--          <label class='col s12 m6'>-->
<!--            {{resource.phone}}-->
<!--            <input-->
<!--              type='text'-->
<!--              id='telephone'-->
<!--              name='telephone'-->
<!--              v-model='user.telephone'-->
<!--              required-->
<!--              :placeholder='resource.phone'-->
<!--              (blur)='phoneOnBlur($event)'/>-->
<!--          </label>-->
<!--          <label class='col s12 m6'>-->
<!--            {{resource.email}}-->
<!--            <input-->
<!--              type='text'-->
<!--              id='email'-->
<!--              name='email'-->
<!--              v-model='user.email'-->
<!--              required-->
<!--              :placeholder='resource.email'-->
<!--              (blur)='emailOnBlur($event)'/>-->
<!--          </label>-->
<!--          <label class='col s12 m6'>-->
<!--            {{resource.role_type}}-->
<!--            <div class='radio-group'>-->
<!--              <label>-->
<!--                <input type='radio' id='roleTypeM' name='roleType' value='M' v-model='user.roleType'>-->
<!--                {{resource.role_type_operator}}-->
<!--              </label>-->
<!--              <label>-->
<!--                <input type='radio' id='roleTypeC' name='roleType' value='C' v-model='user.roleType'>-->
<!--                {{resource.role_type_approver}}-->
<!--              </label>-->
<!--            </div>-->
<!--          </label>-->
<!--          <label class='col s12 m6'>-->
<!--            {{resource.user_activate}}-->
<!--            <div class='radio-group'>-->
<!--              <label>-->
<!--                <input type='radio' id='activate' name='activate' value='T' v-model='user.activate'>-->
<!--                {{resource.yes}}-->
<!--              </label>-->
<!--              <label>-->
<!--                <input type='radio' id='activateF' name='activate' value='F' v-model='user.activate'>-->
<!--                {{resource.no}}-->
<!--              </label>-->
<!--            </div>-->
<!--          </label>-->
<!--          &lt;!&ndash; <label class='col s12 m6'>-->
<!--             {{resource.user_access_date}}-->
<!--             <div>-->
<!--               <label class='col s12 m6'>-->
<!--                 {{resource.user_access_date_from}}-->
<!--                 <input type='text'-->
<!--                        #dp='bsDatepicker'-->
<!--                        bsDatepicker-->
<!--                        name='accessDateFrom'-->
<!--                        v-model='user.accessDateFrom'>-->
<!--               </label>-->
<!--               <label class='col s12 m6'>-->
<!--                 {{resource.user_access_date_to}}-->
<!--                 <input type='text'-->
<!--                        #dp='bsDatepicker'-->
<!--                        bsDatepicker-->
<!--                        name='accessDateTo'-->
<!--                        v-model='user.accessDateTo'>-->
<!--               </label>-->
<!--             </div>-->
<!--           </label>-->
<!--           <label class='col s12 m6'>-->
<!--             {{resource.user_access_time}}-->
<!--             <div>-->
<!--               <label class='col s12 m6'>-->
<!--                 {{resource.user_access_time_from}}-->
<!--                 <timepicker id='accessTimeFrom'-->
<!--                             name='accessTimeFrom'-->
<!--                             v-model='user.accessTimeFrom'>-->
<!--                 </timepicker>-->
<!--               </label>-->
<!--               <label class='col s12 m6'>-->
<!--                 {{resource.user_access_time_to}}-->
<!--                 <timepicker id='accessTimeTo'-->
<!--                             name='accessTimeTo'-->
<!--                             v-model='user.accessTimeTo'>-->
<!--                 </timepicker>-->
<!--               </label>-->
<!--             </div>-->
<!--           </label>&ndash;&gt;-->
<!--        </section>-->
<!--      </div>-->
<!--      <footer>-->
<!--        <button type='submit' id='btnSave' name='btnSave' @click='saveOnClick($event)'>-->
<!--          {{resource.save}}-->
<!--        </button>-->
<!--      </footer>-->
<!--    </form>-->
<!--  </div>-->

</template>
