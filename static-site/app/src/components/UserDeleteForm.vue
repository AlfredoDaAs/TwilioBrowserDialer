<script>
import axios from "../axios";
import { handleError } from '../handleErrors';

export default {
  name: "UserDeleteForm",
  data: () => ({
      name: '',
      lastName: '',
      email: ''
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

            this.name = user.name;
            this.lastName = user.lastName;
            this.email = user.email;
          }
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    },
    handleDelete(e) {
      e.preventDefault();

      this.onDelete();
    },
    async onDelete() {
      try {
        const result = await axios.delete(`users/${this.id}`)

        if(result.data) {
          this.$emit('onDeleted');
        }
      } catch (error) {
        handleError(error, this, 'danger');
      }
    },
    cancel(e) {
      e.preventDefault();

      this.$emit('onClose')
    },
  }
};
</script>

<template>
  <b-modal
    title="Delete User"
    ok-title="Delete"
    ok-variant="outline-danger"
    @ok="handleDelete"
    cancel-variant="outline-secondary"
    @cancel="cancel"
  >
    <b-form>
      <p>Are you sure you want to delete {{`${name} ${lastName}`}}?</p>
    </b-form>
  </b-modal>
</template>