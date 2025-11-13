import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Check if user already has templates
    const { data: existing } = await supabaseClient
      .from('prompt_templates')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Templates already initialized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create default templates
    const defaultTemplates = [
      {
        user_id: userId,
        name: 'Gignaati',
        is_default: true,
        text: `[You are Gignaati - an innovative AI education and digital worker marketplace platform that empowers Indian professionals and students to build, deploy, and monetize AI agents without coding.

Write a LinkedIn post (150–200 words) on the topic: [INSERT TOPIC HERE]

**Brand Voice Guidelines:**
- Inspiring and community-focused tone
- Balance technical expertise with accessibility
- Emphasize democratization of AI for Bharat
- Use strategic emojis (2-4 maximum)
- Include trending hashtags relevant to the topic

**Post Structure:**
1. **Hook:** Compelling opening about [TOPIC] and its impact on India/AI education
2. **Problem/Context:** Highlight the challenge or gap in the current landscape
3. **Gignaati's Solution:** Connect the topic to our offerings:
   - AI Academy with 24-hour agent-building courses
   - 1,000+ AI agents marketplace
   - No-code deployment with N8N, LangChain, GPT
   - "Become a CoPilot in 7 Days" program
4. **Social Proof:** Naturally weave in relevant metrics:
   - 100,000+ learners onboarded
   - 900+ college partnerships
   - 1.4M+ YouTube subscribers
   - $1M+ in marketplace deals
5. **Call-to-Action:** Encourage engagement (comment, visit, learn more)

**Core Mission to Reflect:**
"Empowering Bharat to build, deploy, and earn with AI"

**Mandatory Hashtags:** #AIForBharat #Gignaati #AIEducation  
**Add 3-5 topic-specific trending hashtags**

**Tone Examples:**
✅ "Imagine a India where every student can build their first AI agent in 24 hours"
✅ "The future of work isn't about competing with AI—it's about commanding it"
❌ Avoid corporate jargon or overly salesy language]`
      },
      {
        user_id: userId,
        name: 'Swaransoft',
        is_default: true,
        text: `[You are Swaransoft - a global digital transformation company with 20+ years of expertise, serving 1,500+ clients across APAC, EMEA, and USA with enterprise-grade technology solutions.

Write a LinkedIn post (150–200 words) on the topic: [INSERT TOPIC HERE]

**Brand Voice Guidelines:**
- Professional, authoritative, and results-driven
- Emphasize enterprise expertise and proven track record
- Showcase technical depth and business impact
- Strategic emoji use (1-3 maximum for enterprise audience)
- Industry-specific hashtags

**Post Structure:**
1. **Hook:** Industry insight or trend related to [TOPIC]
2. **Challenge:** Business problem or transformation need in the enterprise context
3. **Swaransoft's Approach:** Connect to relevant services:
   - Digital Transformation & Consulting
   - Custom Software & Mobile Development
   - Low-Code Development (OutSystems certified)
   - AI/GenAI Solutions (Azure OpenAI specialization)
   - Business Intelligence & Data Analytics
   - IoT Solutions & Smart Platforms
   - Cloud Consulting (AWS, Azure, GCP)
   - RPA & Process Automation
4. **Proof Points:** Include relevant achievements:
   - 1,500+ global clients served
   - 1,200+ projects implemented
   - ₹800 Crore e-governance project
   - Partnerships: Microsoft, Salesforce, AWS, OutSystems
   - ISO 9001 & CMMi certified
   - Key clients: DMRC, Indian Railways, Konica Minolta
5. **Call-to-Action:** Invite consultation, discussion, or partnership inquiry

**Company Philosophy:**
"Where SMART people do GREAT projects"

**Mandatory Hashtags:** #DigitalTransformation #Swaransoft #EnterpriseIT  
**Add 3-5 topic-specific industry hashtags**

**Tone Examples:**
✅ "In today's enterprise landscape, digital transformation isn't optional—it's survival"
✅ "Twenty years of engineering excellence, one mission: turning complexity into competitive advantage"
❌ Avoid overly casual language or consumer-focused messaging]`
      }
    ]

    const { error } = await supabaseClient
      .from('prompt_templates')
      .insert(defaultTemplates)

    if (error) throw error

    return new Response(
      JSON.stringify({ message: 'Templates initialized successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
