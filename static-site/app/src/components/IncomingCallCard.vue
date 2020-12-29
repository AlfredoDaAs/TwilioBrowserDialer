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
    callAttributes: {
      type: Object
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
    callAttributes(newVal, oldVal) {
      this.call = newVal;
      if(Object.keys(newVal).length > 0) {
        this.contactForm.phoneNumber = newVal.from
      }
    },
  },
  methods: {
    async saveContact() {
      try {
        this.$v.$touch();
        if (this.$v.$invalid) {
          handleError(new Error("Missing required fields"), this, "danger");
          return;
        }

        const cleanPhoneNumber = `+${this.phoneNumber.trim().replace(/[a-zA-Z_-]|\s|\.|,|&/g, '')}`
        const result = await axios.post("contacts", {
          ...this.contactForm,
          phoneNumber: cleanPhoneNumber
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
      <p v-if="call && Object.keys(call).length > 0" style="display: inline-block;">
        From: {{ call.from }}, City: {{ call.from_city }}, Country: {{ call.from_country }}, State: {{ call.from_state }}, Zip: {{ call.from_zip }}
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