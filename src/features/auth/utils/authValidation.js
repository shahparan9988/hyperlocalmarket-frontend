export function validateLoginForm(values) {
    const errors = {};

    if (!values.emailOrPhone) {
        errors.emailOrPhone = "Email or Phone is required";
    } else if (!/\S+@\S+\.\S+/.test(values.emailOrPhone)) {
        errors.emailOrPhone = "Email is invalid";
    }

    if (!values.password) {
        errors.password = "Password is required";
    } else if (values.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
    }

    return errors;
}

export function validateRegisterForm(values) {
    const errors = {};

    if (!values.email?.trim()) {
        errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = "Email is invalid";
    }

    if (!values.phone?.trim()) {
        errors.phone = "Phone is required";
    }
    if (!values.password) {
        errors.password = "Password is required";
    } else if (values.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
    }
    return errors;
}