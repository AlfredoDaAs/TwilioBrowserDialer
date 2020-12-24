<script>
import { required } from "vuelidate/lib/validators";
import axios from "../axios";
import { handleError, handleMessage } from "../handleErrors";

export default {
  name: "IncomingCallCard",
  data: () => ({
    call: null,
    contactForm: {
      firstName: null,
      lastName: null,
      phoneNumber: null,
      company: null,
    },
  }),
  props: {
    callId: {
      type: String,
      default: "",
    },
  },
  validations: {
    contactForm: {
      firstName: {
        required,
      },
      lastName: {
        required,
      },
      phoneNumber: {
        required,
      },
    },
  },
  watch: {
    callId(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.loadCallInfo();
      }
    },
  },
  methods: {
    async loadCallInfo() {
      try {
        if (this.callId !== null && this.callId !== "") {
          const result = await axios.get(`calls/${this.callId}`);

          if (result.data) {
            this.call = result.data;
          }
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    },
    async saveContact() {
      try {
        this.$v.$touch();
        if (this.$v.$invalid) {
          handleError(new Error("Missing required fields"), this, "danger");
          return;
        }

        const result = await axios.post("contacts", {
          ...this.contactForm,
        });

        if (result.data) {
          handleMessage("Contact created!", this, "success");
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    },
    resetContactForm() {
      this.contactForm.firstName = null
      this.contactForm.lastName = null
      this.contactForm.company = null
      this.contactForm.phoneNumber = null
      this.$nextTick(() => {
          this.$v.$reset();
      })
    }
  },
};
</script>

<template>
  <div id="inbound-calls" class="mb-3">
  <div class="d-flex justify-content-between mb-2">
    <div>
      <h5 style="display: inline-block;" class="mr-3">Incoming Call:</h5>
      <p v-if="call !== null" style="display: inline-block;">
        From: {{ call.fromData.from }}, City: {{ call.fromData.city }}, Country: {{ call.fromData.country }}, State: {{ call.fromData.state }}, Zip: {{ call.fromData.zip }}
      </p>
    </div>
    <b-button v-b-toggle.collapse-1 variant="primary">Store Contact</b-button>
  </div>
  <b-collapse id="collapse-1" class="mt-2">
    <div style="width: 100%">
      <b-form @submit.stop.prevent="saveContact" @reset="resetContactForm">
        <h5 class="text-left">Store Contact</h5>
        <b-row>
          <b-col md="6">
            <b-form-input
              v-model="$v.contactForm.firstName.$model"
              type="text"
              placeholder="First Name"
              :state="$v.contactForm.firstName.$dirty ? !$v.contactForm.firstName.$error : null"
            ></b-form-input>
          </b-col>
          <b-col md="6">
            <b-form-input
              v-model="$v.contactForm.lastName.$model"
              type="text"
              placeholder="Last Name"
              :state="$v.contactForm.lastName.$dirty ? !$v.contactForm.lastName.$error : null"
            ></b-form-input>
          </b-col>
        </b-row>
        <b-row class="mt-2">
          <b-col md="6">
            <b-form-input
              v-model="$v.contactForm.phoneNumber.$model"
              type="text"
              placeholder="Phone Number"
              :state="$v.contactForm.phoneNumber.$dirty ? !$v.contactForm.phoneNumber.$error : null"
            ></b-form-input>
          </b-col>
          <b-col md="6">
            <b-form-input
              v-model="contactForm.company"
              type="text"
              placeholder="Company"
            ></b-form-input>
          </b-col>
        </b-row>
        <div class="d-flex justify-content-end mt-2">
          <b-button class="mr-2" type="submit" variant="outline-primary"
            >Submit</b-button
          >
          <b-button type="reset" variant="outline-secondary">Clear</b-button>
        </div>
      </b-form>
    </div>
  </b-collapse>
</div>
</template>