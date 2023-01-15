
import axios from 'axios';
import React, { useState } from "react";
import {
  render,
  BlockStack,
  Checkbox,
  useCustomer

} from "@shopify/checkout-ui-extensions-react";


// Set the entry point for the extension
render("Checkout::Reductions::RenderBefore", () => <App />);


async function helper (shopifyCustomer, setRiseCustomer) {  
  
 if (shopifyCustomer.id) {
  await axios.get(`/api/customer/${shopifyCustomer.id}?shop_url=checkout-ui-lir.myshopify.com`).then(({ data: customer }) => {
      setRiseCustomer(customer);
  })
}}

  function App() {
  // Set up the checkbox state
  const [checked, setChecked] = useState(false);
  const [riseCustomer, setRiseCustomer] = useState({})

  const shopifyCustomer = useCustomer()


  // Set a function to handle the Checkbox component's onChange event
  const handleChange = () => {
    setChecked(!checked);
  };
  

  // Render the extension components
  return (
    <BlockStack>
      {{ riseCustomer }}
      <Checkbox checked={checked} onChange={handleChange}>
        Do you want to apply your credits? 
      </Checkbox>
    </BlockStack>
  );
}
