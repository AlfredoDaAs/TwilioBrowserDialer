<script>
import axios from "../axios";
import { required, email, numeric, minValue } from "vuelidate/lib/validators";
import { handleError } from "../handleErrors";
import { log } from 'util';

export default {
  name: "UserUpdateForm",
  data: () => ({
    name: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    deparment: ""
  }),
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
      numeric,
    },
    deparment: {
      required,
    },
  },
  watch: {
    id(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.loadUser(newVal);
      }
    }
  },
  methods: {
    async loadUser(id) {
      try {
        if (id) {
          const result = await axios.get(`users/${id}`);

          if (result.data) {
            const user = result.data;

            this.name = user.name;
            this.lastName = user.lastName;
            this.email = user.email;
            this.phoneNumber = user.phoneNumber;
            this.deparment = user.deparment;
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
          const result = await axios.put(`users/${this.id}`, {
            name: this.name,
            lastName: this.lastName,
            phoneNumber: this.phoneNumber,
            deparment: this.deparment,
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
      if(!visible) {
        this.close();
      }
    },
    close(e) {
      if(e) {
        e.preventDefault();
      }

      this.$emit("onClose");
    },
  }
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
          v-model="name"
          type="text"
          required
          placeholder="Enter name"
          :state="$v.name.$dirty ? !$v.name.$error : null"
        ></b-form-input>
      </b-col>
      <b-col md="6" sm="12">
        <b-form-input
          v-model="lastName"
          type="text"
          required
          placeholder="Enter lastName"
          :state="$v.lastName.$dirty ? !$v.lastName.$error : null"
        ></b-form-input>
      </b-col>
    </b-row>
    <b-row class="pt-3">
      <b-col md="6" sm="12">
        <b-form-input
          min="10"
          v-model="deparment"
          type="text"
          required
          placeholder="Enter deparment"
          :state="$v.deparment.$dirty ? !$v.deparment.$error : null"
        ></b-form-input>
      </b-col>
      <b-col md="6" sm="12">
        <b-form-input
          min="10"
          v-model="phoneNumber"
          type="number"
          required
          placeholder="Enter number"
          :state="$v.phoneNumber.$dirty ? !$v.phoneNumber.$error : null"
        ></b-form-input>
      </b-col>
    </b-row>
  </b-modal>
</template>