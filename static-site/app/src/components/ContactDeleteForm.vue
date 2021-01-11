<script>
import axios from "../axios";
import { handleError, handleMessage } from "../handleErrors";

export default {
  name: 'ContactDeleteForm',
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
          const result = await axios.delete(`/contacts/${this.contact.id}`)

          if(result.data) {
            handleMessage("Contact Deleted!", this, "success");
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
    <p>
      Are you sure you want to delete contact {{ `${contactForm.firstName} ${contactForm.lastName}` }} ({{ contactForm.phoneNumber }})
    </p>
  </b-modal>
</template>