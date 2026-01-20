/**
 * Test script for email generation API endpoints
 * Tests both welcome and rejection email generation
 * 
 * Usage: npx tsx scripts/test-email-api.ts
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_URL || "https://zynra.studio" // Production URL

async function testWelcomeEmailAPI() {
  console.log("🧪 Testing Welcome Email API...")
  console.log("=" .repeat(60))

  const testData = {
    templatePageId: "2ee13f3ae6f38117b3eef77f98ce06c2", // Welcome Email Template (with content)
    leadData: {
      name: "John Doe",
      email: "john@example.com",
      service: "Website Development",
      company: " and your team at TechCorp", // Note: includes " and" prefix for template
      budgetRange: " with a budget range of $10,000-$25,000",
      timeline: "You're looking to launch in 3-4 months",
      message: "\n\nYou mentioned: 'We need a modern, responsive website with e-commerce capabilities.'",
      schedulingLink: "https://cal.com/zynra-studio"
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-welcome-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    })

    const data = await response.json()

    console.log("\n📊 Response Status:", response.status)
    console.log("✅ Success:", data.success)
    
    if (data.success) {
      console.log("\n📧 Subject:", data.subject)
      console.log("\n📝 HTML Length:", data.html?.length || 0, "characters")
      console.log("\n🔍 HTML Preview (first 500 chars):")
      console.log(data.html?.substring(0, 500) || "No HTML content")
      console.log("\n✅ Welcome Email API Test PASSED")
    } else {
      console.log("\n❌ Error:", data.error)
      console.log("Details:", data.details)
      console.log("\n❌ Welcome Email API Test FAILED")
    }
  } catch (error) {
    console.error("\n❌ Request failed:", error)
    console.log("\n❌ Welcome Email API Test FAILED")
  }

  console.log("=" .repeat(60))
}

async function testRejectionEmailAPI() {
  console.log("\n🧪 Testing Rejection Email API...")
  console.log("=" .repeat(60))

  const testData = {
    templatePageId: "2ee13f3ae6f381cca68ae4b059d8eda5", // Rejection Email Template (with content)
    leadData: {
      name: "Jane Smith",
      email: "jane@example.com",
      rejectionReason: "Your project scope is outside our current service offerings."
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-rejection-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    })

    const data = await response.json()

    console.log("\n📊 Response Status:", response.status)
    console.log("✅ Success:", data.success)
    
    if (data.success) {
      console.log("\n📧 Subject:", data.subject)
      console.log("\n📝 HTML Length:", data.html?.length || 0, "characters")
      console.log("\n🔍 HTML Preview (first 500 chars):")
      console.log(data.html?.substring(0, 500) || "No HTML content")
      console.log("\n✅ Rejection Email API Test PASSED")
    } else {
      console.log("\n❌ Error:", data.error)
      console.log("Details:", data.details)
      console.log("\n❌ Rejection Email API Test FAILED")
    }
  } catch (error) {
    console.error("\n❌ Request failed:", error)
    console.log("\n❌ Rejection Email API Test FAILED")
  }

  console.log("=" .repeat(60))
}

async function main() {
  console.log("\n🚀 Email API Test Suite")
  console.log("=" .repeat(60))
  console.log(`Testing endpoints at: ${API_BASE_URL}`)
  console.log("=" .repeat(60))
  console.log("\nNOTE: Make sure your dev server is running (npm run dev)")
  console.log("NOTE: Update templatePageId values with your actual Notion page IDs\n")

  await testWelcomeEmailAPI()
  await testRejectionEmailAPI()

  console.log("\n✅ All tests completed!")
  console.log("\nIf tests pass but Make.com scenario fails, check:")
  console.log("1. HTTP module response mapping in Make.com")
  console.log("2. Template page IDs in Make.com are correct")
  console.log("3. Lead data mapping from Notion module is correct")
}

main().catch(console.error)
