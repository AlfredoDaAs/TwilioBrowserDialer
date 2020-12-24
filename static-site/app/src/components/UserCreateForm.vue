<script>
import axios from "../axios";
import { required, email, numeric, minValue } from "vuelidate/lib/validators";
import { handleError } from "../handleErrors";
import { mapGetters } from "vuex";

export default {
  name: "UserCreateForm",
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
      return this.getDepartments.map((dep) => ({
        value: dep.name.trim().toLowerCase().replace(" ", "_"),
        text: dep.name,
      }));
    },
  },
  validations: {
    lastName: {
      required,
    },
    name: {
      required,
    },
    email: {
      required,
      email,
    },
    selectedDepts: {
      required,
    },
  },
  methods: {
    async onSubmit() {
      try {
        this.$v.$touch();
        if (this.$v.$invalid) {
          handleError(new Error("Missing required fields"), this, "danger");
        } else {
          const result = await axios.post("/users", {
            name: this.name,
            lastName: this.lastName,
            email: this.email,
            phoneNumber: this.phoneNumber,
            departments: this.selectedDepts,
          });

          if (result.data) {
            this.onReset();
            this.$emit("onSubmitted");
          }
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    },
    onReset() {
      // Reset our form values
      this.email = "";
      this.phoneNumber = "";
      this.name = "";
      this.lastName = "";
      this.selectedDepts = [];

      this.$nextTick(() => {
        this.$v.$reset();
      });
    },
  },
};
</script>

<template>
  <div id="create-user-section" class="mb-4">
    <div class="d-flex mb-3">
      <h3 class="d-inline-block">
        Create User
        <b-button
          variant="link"
          class="d-inline-block"
          size="sm"
          v-b-toggle.create-user
          ><b-icon-plus-circle></b-icon-plus-circle
        ></b-button>
      </h3>
    </div>
    <b-collapse id="create-user">
      <b-card>
        <b-form @submit.stop.prevent="onSubmit" @reset="onReset">
          <b-row>
            <b-col md="6" sm="12">
              <b-form-input
                v-model="name"
                type="text"
                placeholder="Enter name"
                :state="$v.name.$dirty ? !$v.name.$error : null"
              ></b-form-input>
            </b-col>
            <b-col md="6" sm="12">
              <b-form-input
                v-model="lastName"
                type="text"
                placeholder="Enter lastname"
                :state="$v.lastName.$dirty ? !$v.lastName.$error : null"
              ></b-form-input>
            </b-col>
          </b-row>
          <b-row class="pt-3">
            <b-col md="6" sm="12">
              <b-form-input
                v-model="email"
                type="email"
                placeholder="Enter email"
                :state="$v.email.$dirty ? !$v.email.$error : null"
              ></b-form-input>
            </b-col>
            <b-col md="6" sm="12">
              <b-form-input
                min="10"
                v-model="phoneNumber"
                type="number"
                placeholder="Enter number"
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
                  v-model="selectedDepts"
                  :options="departments"
                  multiple
                  :select-size="5"
                  :state="
                    $v.selectedDepts.$dirty ? !$v.selectedDepts.$error : null
                  "
                ></b-form-select>
              </b-form-group>
            </b-col>
          </b-row>

          <div class="d-flex justify-content-end mt-2">
            <b-button class="mr-2" type="submit" variant="outline-primary"
              >Submit</b-button
            >
            <b-button type="reset" variant="outline-secondary">Clear</b-button>
          </div>
        </b-form>
      </b-card>
    </b-collapse>
  </div>
</template>