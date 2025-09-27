#!/usr/bin/env node

// Тестирование API презентаций
const axios = require("axios");

const API_BASE_URL = "https://presentology-back-production.up.railway.app";
const token =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJ1c2xhbm1ha2htYXRvdjk5OUBnbWFpbC5jb20iLCJzdWIiOiJjbWZ5ZmdsZHkwMDAycGoxMXZ5aHF0cnpwIiwiaWF0IjoxNzU4NzQ1MTYzLCJleHAiOjE3NjEzMzcxNjN9.i1mcWQQKIB0FvnT2oVfTWpUUkCFXgPCIq9Uhgyjunwk";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: token,
    "Content-Type": "application/json",
  },
});

async function testPresentationFlow() {
  try {
    console.log("🚀 Starting presentation flow test...");

    // Step 1: Create presentation
    console.log("📝 Step 1: Creating presentation...");
    const createData = {
      title: "Тест: инновационный инструмент оптимизации бизнес-процессов",
      description: "тест",
      slug:
        "тест-инновационный-инструмент-оптимизации-бизнес-процессов-" +
        Date.now(),
      generatedData: {
        deckTitle:
          "Тест: инновационный инструмент оптимизации бизнес-процессов",
        uiSlides: [
          {
            title: "Титульный слайд",
            summary:
              "Название проекта: «тест»\nСлоган: «тест» – инновационный инструмент для оптимизации процессов",
          },
          {
            title: "Проблема и решение",
            summary:
              "Проблема: на рынке отсутствует высокоэффективное решение\nРешение: «тест» сочетает передовые алгоритмы",
          },
          {
            title: "Инвестиционное предложение",
            summary: "Требуемая сумма: 1,5 млн $\nУсловия: 20% доли в компании",
          },
        ],
        userData: {
          topic: "тест",
          goal: "sell",
          audience: "investors",
          expectedAction: "decision",
          keyIdea: "тест",
          tones: ["business"],
          files: [],
        },
        volume: "Минимальный",
        imageSource: "Из интернета",
        seed: 42,
        concurrency: 5,
      },
      presentationState: {
        textElementPositions: {},
        textElementContents: {},
        textElementStyles: {},
        imageElements: {},
        tableElements: {},
        selectedTemplateIndex: 0,
        selectedStyleIndex: 0,
      },
      templateIds: ["proto_001"],
      isPublic: false,
    };

    const createResponse = await client.post(
      "/presentations/create-with-data",
      createData
    );
    console.log("✅ Presentation created:", createResponse.data.id);

    // Step 2: Generate slides
    console.log("🎨 Step 2: Generating slides...");
    const generateData = createData.generatedData;

    const generateResponse = await client.post(
      "/ai-proxy/v1/create/structure/generate-slides",
      generateData
    );
    console.log("✅ Slides generated:", generateResponse.data.success);

    // Step 3: Update presentation with generated data
    console.log("💾 Step 3: Updating presentation with generated data...");
    const updateData = {
      presentationId: createResponse.data.id,
      presentationData: generateResponse.data,
      templateIds: generateResponse.data.data?.templateIds || ["proto_006"],
      presentationState: {
        textElementPositions: {},
        textElementContents: {},
        textElementStyles: {},
        imageElements: {},
        tableElements: {},
        selectedTemplateIndex: 0,
        selectedStyleIndex: 0,
      },
    };

    const updateResponse = await client.put(
      "/presentations/update-with-data",
      updateData
    );
    console.log("✅ Presentation updated with generated data");
    console.log("📊 Final presentation:", {
      id: updateResponse.data.id,
      title: updateResponse.data.title,
      type: updateResponse.data.type,
      updatedAt: updateResponse.data.updatedAt,
    });

    console.log("🎉 Test completed successfully!");
  } catch (error) {
    console.error("❌ Error during test:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
}

testPresentationFlow();
