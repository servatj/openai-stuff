
import OpenAI from "openai"
import dotenv from "dotenv"

dotenv.config()

import { dates } from "../utils/dates.js"

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

async function main() {

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  
    const tickers = [
      'AAPL',
      'GOOGL',
      'TSLA',
    ]
    
    console.log('Fetching stock data...')
    const stockData = await Promise.all(tickers.map(async (ticker) => {
      const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${POLYGON_API_KEY}`
      const response = await fetch(url)
      const data = await response.text()
      return data;     
    }))
    
    const messages = [
      {
        role: 'system',
        content: 'You are a trading guru. Given data on share prices over the past 3 days, write a report markdown with icons of no more than 150 words describing the stocks performance and recommending whether to buy, hold or sell.'
      },
      {
        role: 'user',
        content: `
            You are a financial advisory assistant. Your role is to generate an advisory report for a given stock using the provided data. Always include a disclaimer stating that you are not a licensed financial advisor and that the report is for informational purposes only.

            Example 1:
            user: "generate an advise report with this stock {stockData: { symbol: 'AAPL', price: 150, volume: 2000000, performance: 'positive' }}"
            Assistant: "Apple Inc. (AAPL) is showing a positive trend with its stock price around $150 and a solid trading volume of 2,000,000 shares. This performance indicates favorable market sentiment; however, past performance is not necessarily indicative of future results. Please note that this report is for informational purposes only and should not be taken as professional financial advice."

            Example 2:
            User: "generate an advise report with this stock {stockData: { symbol: 'TSLA', price: 700, volume: 3000000, performance: 'volatile' }}"
            Assistant: "Tesla Inc. (TSLA) is currently experiencing volatility with a stock price near $700 and a high trading volume of 3,000,000 shares. The fluctuating performance suggests caution for short-term investors. This advisory report is based on current market data and is intended for informational purposes only. Consult with a licensed financial advisor before making any investment decisions."

            Now, please generate an advise report for the following stock data:
            ${stockData}
        `
      }
    ]
    
    console.log('Sending messages to AI for tickers:', tickers.join(', '))
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.5
    })
    
    console.log(response.choices[0].message.content)

  } catch (error) {
    console.error(error)
  }
  
}

main()