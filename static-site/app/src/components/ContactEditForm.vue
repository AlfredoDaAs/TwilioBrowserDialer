<script>
import axios from "../axios";
import { handleError, handleMessage } from "../handleErrors";
import { required } from "vuelidate/lib/validators";

export default {
  name: 'ContactEditForm',
  data: () => ({
    contactForm: {
      firstName: null,
      lastName: null,
      phoneNumber: null,
      company: null,
    },
  }),
  props: {
    contact: {
      type: Object,
      default: () => ({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        company: '',
      })
    },
    show: {
      type: Boolean,
      default: false,
      required: true
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
    contact(newVal, oldVal) {
      if(Object.keys(newVal).length > 0) {
        this.contactForm.firstName = newVal.firstName
        this.contactForm.lastName = newVal.lastName
        this.contactForm.phoneNumber = newVal.phoneNumber
        this.contactForm.company = newVal.company
      } else {
        this.contactForm.firstName = ''
        this.contactForm.lastName = ''
        this.contactForm.phoneNumber = ''
        this.contactForm.company = ''
      }
    }
  },
  methods: {
    handleOk(e) {
      e.preventDefault();
      this.onSubmit();
    },
    async onSubmit(contact) {
      try {
        if(this.contact.id){
          const cleanPhoneNumber = `${this.contactForm.phoneNumber.startsWith('+') ? '' : '+'}${this.contactForm.phoneNumber.trim().replace(/[a-zA-Z_-]|\s|\.|,|&/g, '')}`
          const result = await axios.put(`/contacts/${this.contact.id}`, {
            ...this.contactForm,
            phoneNumber: cleanPhoneNumber
          })

          if(result.data) {
            handleMessage("Contact Updated!", this, "success");
            this.$emit("onSubmitted");
          }
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    },
    onReset() {
      this.show = false
    },
    close(e) {
      if (e) {
        e.preventDefault();
      }

      this.$emit("onClose");
    },
    onChange(visible) {
      if (!visible) {
        this.close();
      }
    },
  }
}
</script>

<template>
  <b-modal
    title="Edit Contact"
    :visible="show"
    ok-title="Submit"
    ok-variant="outline-primary"
    @ok="handleOk"
    cancel-variant="outline-secondary"
    @cancel="close"
    @change="onChange"
  >
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
  </b-modal>
</template>