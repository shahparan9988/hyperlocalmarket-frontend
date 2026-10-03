export function mapLoginFormToRequest(values) {
    return {
        emailOrPhone: values.emailOrPhone,
        password: values.password,
    };
}

export function mapRegisterFormToRequest(values) {
    return {
        phone: values.phone.trim(),
        email: values.email.trim(),
        password: values.password,
    };
}   

