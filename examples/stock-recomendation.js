
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
        content: `generate an advise report with this stock ${stockData}`
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