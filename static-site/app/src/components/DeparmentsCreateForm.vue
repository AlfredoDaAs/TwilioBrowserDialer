<script>
import { required } from 'vuelidate/lib/validators'
import axios from '../axios'
import { handleError, handleMessage } from '../handleErrors'

export default {
  name: 'DepartmentCreateForm',
  data: () => ({
    name: ''
  }),
  validations: {
    name: {
      required
    }
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();

      this.submit();
    },
    async submit() {
      try {
        this.$v.$touch()
        if(this.$v.$invalid) {
            handleError(new Error('Missing required fields'), this, 'danger')
            return;
        }

        const result = await axios.post('/deparments', {
          name: this.name
        })

        if(result.data) {
          handleMessage('Deparment was successfuly created', this, 'success')
          this.onReset();
        }
      } catch (error) {
        handleError(error, this, 'danger')
      }
    },
    onReset() {
      this.name = ''
      this.$nextTick(() => {
          this.$v.$reset();
      })
    }
  }
}
</script>

<template>
  <b-form @submit.stop.prevent="onSubmit" @reset="onReset">
    <b-form-input
      id="dep-name"
      v-model="name"
      type="text"
      placeholder="Enter department name"
      :state="$v.name.$dirty ? !$v.name.$error : null"
    ></b-form-input>
    <div class="d-flex justify-content-end mt-2">
        <b-button class="mr-2" type="submit" variant="outline-primary">Submit</b-button>
        <b-button type="reset" variant="outline-secondary">Clear</b-button>
    </div>
  </b-form>
</template>