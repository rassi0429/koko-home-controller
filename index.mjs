import express from "express"
import axios from "axios"
import dotenv from "dotenv"
import formData from "form-data"
dotenv.config()
const app = new express()

const nature_endpoint = "https://api.nature.global"

app.get("/", (req, res) => {
    res.send("hello world!")
})

app.get("/light", async (req, res) => {
    const { data } = await axios.get(nature_endpoint + "/1/appliances", { headers: { "Authorization": `Bearer ${process.env.NATURE_TOKEN}` } })
    let state = null
    for (const device of data) {
        if (device.id === process.env.LIGHT_ID) {
            state = device.light.state
        }
    }
    res.send(state)
})

app.post("/light", async (req, res) => {
    const query = req.query.button === "on" ? "on" : "off"
    const form = new formData()
    form.append("button", query)
    const { data } = await axios.post(`${nature_endpoint}/1/appliances/${process.env.LIGHT_ID}/light`, form, { headers: { "Authorization": `Bearer ${process.env.NATURE_TOKEN}` } })
    res.send(data)
})

app.get("/aircon", async (req, res) => {
    const { data } = await axios.get(nature_endpoint + "/1/appliances", { headers: { "Authorization": `Bearer ${process.env.NATURE_TOKEN}` } })
    let state = null
    for (const device of data) {
        if (device.id === process.env.AIRCON_ID) {
            state = device.settings
        }
    }
    res.send(state)
})

let tmpCache = 0

const  updateTemp = async () => {
    const { data } = await axios.get(nature_endpoint + "/1/devices", { headers: { "Authorization": `Bearer ${process.env.NATURE_TOKEN}` } })
    tmpCache = data[0].newest_events.te.val
}

setInterval(() => {updateTemp()}, 60 * 1000)

app.get("/temp", async (req, res) => {
    res.send(tmpCache + "度")
})

app.get("/prom", (req, res) => {
    const text = `# HELP kokoa_home_temp1 templature of kokoa home
# TYPE kokoa_home_temp1 gauge
kokoa_home_temp1 ${tmpCache}
`
    res.header('Content-Type', 'text/plain;charset=utf-8');
    res.send(text)
})

app.post("/aircon", async (req, res) => {
    const query = req.query.button === "on" ? "power-on" : "power-off"
    const form = new formData()
    form.append("button", query)
    if(req.query.temp) {
        const num = Number(req.query.temp)
        if(num) {
            form.append("temperature", req.query.temp)
        }
    }
    const { data } = await axios.post(`${nature_endpoint}/1/appliances/${process.env.AIRCON_ID}/aircon_settings`, form, { headers: { "Authorization": `Bearer ${process.env.NATURE_TOKEN}` } })
    res.send(data)
})

app.listen(4000, () => {
    console.log("Ok")
    console.log(process.env.NATURE_TOKEN)
})