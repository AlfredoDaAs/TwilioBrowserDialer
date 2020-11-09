<script>
import axios from '../axios'
import { required, email, numeric, minValue } from 'vuelidate/lib/validators'

export default {
    name: 'UserCreateForm',
    data: () => ({
        name: '',
        email: '',
        twilioNumber: ''
    }),
    validations: {
        name: {
            required
        },
        email: {
            required,
            email
        },
        twilioNumber: {
            required,
            numeric,
            minValue: minValue(10)
        }
    },
    methods: {
        async onSubmit() {
            try {
                this.$v.$touch()
                if(this.$v.$invalid) {
                    console.log('launch a toast error message');
                }
                else {
                    const result = await axios.post('/users', {
                        name: this.name,
                        email: this.email,
                        twilioNumber: this.twilioNumber
                    })

                    if(result.data) {
                        this.onReset()
                        this.$emit('onSubmitted')
                    }
                }
            } catch (error) {
                console.log('error', error.message);
            }
        },
        onReset() {
            // Reset our form values
            this.email = ''
            this.twilioNumber = ''
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
        <b-row>
            <b-col>
                <b-form-input
                    v-model="name"
                    type="text"
                    required
                    placeholder="Enter name"
                    :state="$v.name.$dirty ? !$v.name.$error : null"
                ></b-form-input>
            </b-col>
            <b-col>
                <b-form-input
                    v-model="email"
                    type="email"
                    required
                    placeholder="Enter email"
                    :state="$v.email.$dirty ? !$v.email.$error : null"
                ></b-form-input>
            </b-col>
        </b-row>
        <b-row class="pt-3">
            <b-col offset-md="6" md="6" sm="12">
                <b-form-input
                    min="10"
                    v-model="twilioNumber"
                    type="number"
                    required
                    placeholder="Twilio number"
                    :state="$v.twilioNumber.$dirty ? !$v.twilioNumber.$error : null"
                ></b-form-input>
            </b-col>
        </b-row>

        <div class="d-flex justify-content-end mt-2">
            <b-button class="mr-2" type="submit" variant="outline-primary">Submit</b-button>
            <b-button type="reset" variant="outline-secondary">Clear</b-button>
        </div>
    </b-form>
</template>