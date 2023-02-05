import React, { useState, useEffect } from "react";
import {
  render,
  BlockStack,
  Divider,
  View,
  Text,
  Button,
  useCustomer,
  useShop,
  useApplyGiftCardChange,
  useCartLines,
} from "@shopify/checkout-ui-extensions-react";

// Set the entry point for the extension
render("Checkout::Reductions::RenderBefore", () => <App />);
function App() {
  // Get the Customer, Shop, cartLine Objects from Shopify
  const shopifyCustomer = useCustomer()
  const {myshopifyDomain} = useShop()
  const cartLines = useCartLines()

  if (!shopifyCustomer || !myshopifyDomain) return;

  const [checked, setChecked] = useState(false);
  const [giftCard, setCustomerGiftcard] = useState({})
  const [settings, setStoreSettings] = useState({})
  const [quickApplySettings, setQuickApplySettings] = useState({})
  const setCode = useApplyGiftCardChange()
  const customer_id = shopifyCustomer.id.match(/(\d+)/)[0];

   useEffect(() => { 
    const fetchCustomerGiftCard = async () => {
      const responseCustomer = await fetch(`https://strn.rise-ai.com/api/customer/${customer_id}?shop_url=${myshopifyDomain}`);
      const jsonCustomer = await responseCustomer.json();
      setCustomerGiftcard(jsonCustomer?.LoyaltyCard?.GiftCard);
      const responseSettings = await fetch(`https://application.rise-ai.com/str/str/shop?shop_url=${myshopifyDomain}`);
      const jsonSettings = await responseSettings.json();
      setStoreSettings(jsonSettings?.settings)
      const responseQuickApplySettings = await fetch(`https://strn.rise-ai.com/api/storeAssets/quick_apply?shop_url=${myshopifyDomain}`);
      const jsonQuickApplySettings = await responseQuickApplySettings.json();
      setQuickApplySettings(jsonQuickApplySettings)
    };
    fetchCustomerGiftCard();
  }, []);
  
    // Set a function to handle the Checkbox component's onChange event
    const handleChange = () => {
      const type = checked ? "removeGiftCard" : "addGiftCard" ;
      setCode({type, code: giftCard.code});
      setChecked(!checked);
    };

  const fraudRisk = isRiseGiftCardInCart(settings.c2c_giftcard_product_id, cartLines)
  const quickApplyValid = giftCard && giftCard.balance && giftCard.balance > 0 && !fraudRisk

  const htmlText = quickApplySettings?.panel?.text || "";
  const buttonText = quickApplySettings?.panel?.button_text || "";
  const data = [
    myshopifyDomain,
    shopifyCustomer.firstName,
    shopifyCustomer.lastName,
    giftCard.balance,
    giftCard.code
  ]

  // const store_credit_value = giftCard.balance
  console.log(checked)
  if(checked || !quickApplyValid) return null;
  // Render the extension components
  return ( 
      <BlockStack> 
        <Text> {renderQuickApply(htmlText, data)}</Text>
        <View inlineAlignment='start'>
          <Button inlineAlignment='start' onPress={handleChange}>
            {buttonText}
          </Button> 
        </View>
        <Divider>
        </Divider>
    </BlockStack> 
  );
}

function isRiseGiftCardInCart(riseGiftCardId, cartLines) {
  return cartLines.some(line => {
    const productId = line?.merchandise?.product?.id?.match(/(\d+)/)[0];
     return productId === riseGiftCardId;
    });
}

function renderQuickApply(textHTML, data) {
  if(!textHTML) return
  
  const variables = ["{{shop_name}}", "{{customer_first_name}}","{{customer_last_name}}","{{store_credit_value}}","{{store_credit_code}}"]

   variables.forEach((x, i)=>{
    textHTML = textHTML.replace(x, data[i])
  })

  textHTML =textHTML.replaceAll("<strong>", "")
  textHTML =textHTML.replaceAll("<p>", "")
  textHTML =textHTML.replaceAll("</strong>", "")
  textHTML =textHTML.replaceAll("</p>", "")

  return textHTML


}