<script>
import axios from "../axios";
import { required, email, minValue } from "vuelidate/lib/validators";
import { handleError } from "../handleErrors";
import { log } from "util";
import { mapGetters } from 'vuex'

export default {
  name: "UserUpdateForm",
  data: () => ({
    name: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    selectedDepts: [],
  }),
  computed: {
    ...mapGetters(["getDepartments"]),
    departments() {
      return this.getDepartments.map(dep => ({
        value: dep.name.trim(),
        text: dep.name
      }));
    }
  },
  props: {
    id: {
      type: String,
    },
    show: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  validations: {
    name: {
      required,
    },
    lastName: {
      required,
    },
    phoneNumber: {
      required,
    },
    selectedDepts: {
      required,
    },
  },
  watch: {
    id(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.loadUser(newVal);
      }
    },
  },
  methods: {
    async loadUser(id) {
      try {
        if (id) {
          const result = await axios.get(`users/${id}`);

          if (result.data) {
            const user = result.data;

            console.log('user', user);
            this.name = user.name;
            this.lastName = user.lastName;
            this.email = user.email;
            this.phoneNumber = user.phoneNumber;
            this.selectedDepts = user.departments;
          }
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    },
    handleOk(e) {
      e.preventDefault();
      this.handleSubmit();
    },
    async handleSubmit() {
      try {
        this.$v.$touch();
        if (this.$v.$invalid) {
          handleError(new Error("Missing required fields"), this, "danger");
        } else {
          const cleanPhoneNumber = `${this.phoneNumber.startsWith('+') ? '' : '+'}${this.phoneNumber.trim().replace(/[a-zA-Z_-]|\s|\.|,|&/g, '')}`

          const result = await axios.put(`users/${this.id}`, {
            name: this.name,
            lastName: this.lastName,
            phoneNumber: cleanPhoneNumber,
            departments: this.selectedDepts,
          });

          if (result.data) {
            this.$emit("onSubmitted");
          }
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    },
    onChange(visible) {
      if (!visible) {
        this.close();
      }
    },
    close(e) {
      if (e) {
        e.preventDefault();
      }

      this.$emit("onClose");
    },
  },
};
</script>

<template>
  <b-modal
    title="Edit User"
    :visible="show"
    ok-title="Submit"
    ok-variant="outline-primary"
    @ok="handleOk"
    cancel-variant="outline-secondary"
    @cancel="close"
    @change="onChange"
  >
    <h4>Email: {{ this.email }}</h4>
    <hr />
    <b-row>
      <b-col md="6" sm="12">
        <b-form-input
          v-model="$v.name.$model"
          type="text"
          required
          placeholder="Enter name"
          :state="$v.name.$dirty ? !$v.name.$error : null"
        ></b-form-input>
      </b-col>
      <b-col md="6" sm="12">
        <b-form-input
          v-model="$v.lastName.$model"
          type="text"
          required
          placeholder="Enter lastName"
          :state="$v.lastName.$dirty ? !$v.lastName.$error : null"
        ></b-form-input>
      </b-col>
    </b-row>
    <b-row class="pt-3">
      <b-col md="6" sm="12">
        <b-form-group
          id="depts-group-1"
          description="select all departments you want for this User"
          label="Select Departments"
          label-for="depts-select"
        >
          <b-form-select
            id="depts-select"
            v-model="$v.selectedDepts.$model"
            :options="departments"
            multiple
            :select-size="5"
            :state="$v.selectedDepts.$dirty ? !$v.selectedDepts.$error : null"
          ></b-form-select>
        </b-form-group>
      </b-col>
      <b-col md="6" sm="12">
        <b-form-input
          v-model="$v.phoneNumber.$model"
          placeholder="Enter number"
          :state="$v.phoneNumber.$dirty ? !$v.phoneNumber.$error : null"
        ></b-form-input>
      </b-col>
    </b-row>
  </b-modal>
</template>