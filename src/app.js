import axios from "axios"
import fs from "fs"

const apiHeader = "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"
const shopifyUrl = "https://quickstart-71eef196.myshopify.com/admin/api/2023-10"
const shopifyAdmin = {
  products: "/products.json",
  customers: "/customers.json",
  draft_orders: "/draft_orders.json",
}

const shopifyHeaders = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': apiHeader,
}

const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}

const makeRequest = (url, method, data) => {
  return axios({
    url: `${shopifyUrl}${url}`,
    method,
    headers: shopifyHeaders,
    data
  })
}

const generateRandomOrders = async () => {

  const { data: { products } } = await makeRequest(shopifyAdmin.products, "GET")
  const { data: { customers } } = await makeRequest(shopifyAdmin.customers, "GET")

  const productsData = products.map(product => {
    return {
      title: product.title,
      price: product.variants[randomNumber(0, product.variants.length - 1)].price,
      quantity: randomNumber(1, 10),
    }
  })

  const customersIds = customers.map(customer => customer.id)

  const draftOrders = customersIds.map(() => {
    return {
      draft_order: {
        line_items: [productsData[randomNumber(0, productsData.length - 1)]],
        customer: {
          id: customersIds[randomNumber(0, customersIds.length - 1)],
        }
      }
    }
  })

  await Promise.all(draftOrders.map(async (draftOrder) => {

    try {
      const { data } = await makeRequest(shopifyAdmin.draft_orders, "POST", draftOrder)
      console.log(`Order ${data.draft_order.id} created successfully`)
    } catch (error) {
      //console.log(error)
    }

    setTimeout(() => {
      console.log("Waiting 2 seconds to create next order")
    }, 2000)

  }))

}

function main() {
  generateRandomOrders()
}

main()