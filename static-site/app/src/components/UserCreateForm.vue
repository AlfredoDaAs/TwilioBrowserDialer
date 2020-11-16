<script>
import axios from '../axios'
import { required, email, numeric, minValue } from 'vuelidate/lib/validators'
import { handleError } from '../handleErrors'

export default {
    name: 'UserCreateForm',
    data: () => ({
        name: '',
        lastname: '',
        email: '',
        phoneNumber: '',
        deparment:  '',
    }),
    validations: {
        lastname: {
            required
        },
        name: {
            required
        },
        email: {
            required,
            email
        },
        deparment: {
            required
        }
    },
    methods: {
        async onSubmit() {
            try {
                this.$v.$touch()
                if(this.$v.$invalid) {
                    handleError(new Error('Missing required fields'), this, 'danger')
                }
                else {
                    const result = await axios.post('/users', {
                        name: this.name,
                        lastname: this.lastname,
                        email: this.email,
                        phoneNumber: this.phoneNumber,
                        deparment: this.deparment
                    })

                    if(result.data) {
                        this.onReset()
                        this.$emit('onSubmitted')
                    }
                }
            } catch (error) {
                handleError(error, this, 'danger')
            }
        },
        onReset() {
            // Reset our form values
            this.email = ''
            this.phoneNumber = ''
            this.name = ''
            this.lastname = ''
            this.deparment = ''

            this.$nextTick(() => {
                this.$v.$reset();
            })
        }
    }
}
</script>

<template>
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
                    v-model="lastname"
                    type="text"
                    placeholder="Enter lastname"
                    :state="$v.lastname.$dirty ? !$v.lastname.$error : null"
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
                <b-form-input
                    min="10"
                    v-model="deparment"
                    type="text"
                    placeholder="Enter deparment"
                    :state="$v.deparment.$dirty ? !$v.deparment.$error : null"
                ></b-form-input>
            </b-col>
        </b-row>

        <div class="d-flex justify-content-end mt-2">
            <b-button class="mr-2" type="submit" variant="outline-primary">Submit</b-button>
            <b-button type="reset" variant="outline-secondary">Clear</b-button>
        </div>
    </b-form>
</template>