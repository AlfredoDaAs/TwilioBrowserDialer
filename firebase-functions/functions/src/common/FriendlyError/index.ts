import { https } from "firebase-functions"

// Allowed Statuses found here
// https://firebase.google.com/docs/reference/functions/functions.https.HttpsError

// This allows subsystems to return an object we own and can overwrite if we
// ever decide to rip out firebase function calls
const { HttpsError } = https
const FriendlyError = HttpsError

// NOTE someday we'll want our own implementation of this class

// TODO hide "eng errors" from production

export default FriendlyError

export const untrustedClientMessage = "Something went wrong with our application. Please reach out to support for help."

// The below are some quick calls for common cases

export const throwUntrustedClientError = (engErrorMessage: string) => {
    throw new FriendlyError(
        "invalid-argument",
        untrustedClientMessage,
        [
            {engReason: engErrorMessage}
        ]
    )
}

export const throwDatabaseFailure = (engReason: string) => {
    throw new FriendlyError(
        "internal",
        untrustedClientMessage,
        [
            {engReason: engReason}
        ]
    )
}
