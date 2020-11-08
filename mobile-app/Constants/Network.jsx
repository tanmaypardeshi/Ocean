const mode = 'PROD'
const config = {
    "Content-Type" : "application/json"
}

const PROD_URI="https://apis.teamocean.ml/api"
const DEV_URI="http://192.168.29.126:8000/api"

export const SERVER_URI = (mode === 'PROD' ? PROD_URI : DEV_URI);

export const AXIOS_HEADERS = (mode === 'PROD' ? config : {...config, "access-control-allow-origin": "*"})