import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MEAL_COUNT_OPTIONS,
  PRESET_FOODS,
  createCustomFoodItem,
  generateMealPlan,
  lookupCustomFoodNutrition,
} from './mealPlanner';

test('includes all user-requested protein, carb, and fat foods plus popular additions', () => {
  const names = new Set(PRESET_FOODS.map((f) => f.name));
  for (const required of [
    '닭가슴살',
    '계란',
    '고등어',
    '닭안심',
    '우둔살',
    '돼지안심',
    '돼지뒷다리살',
    '흰밥',
    '고구마',
    '감자',
    '옥수수',
    '현미밥',
    '사과',
    '베이글',
    '바나나',
    '아보카도',
    '아몬드',
    '땅콩버터',
    '올리브유',
  ]) {
    assert.ok(names.has(required), `Missing required food: ${required}`);
  }
  assert.ok(!names.has('프로틴 쉐이크'), '프로틴 쉐이크 should be removed from preset foods');
  assert.ok(PRESET_FOODS.length >= 25, 'Should also provide popular extra food options');
});

test('prioritizes staple rice/pasta heavily over banana/fruit and supports up to 6 meals', () => {
  const rice = PRESET_FOODS.find((f) => f.id === 'c_white_rice')!;
  const banana = PRESET_FOODS.find((f) => f.id === 'c_banana')!;
  const chicken = PRESET_FOODS.find((f) => f.id === 'p_chicken_breast')!;
  const yogurt = PRESET_FOODS.find((f) => f.id === 'p_greek_yogurt')!;
  const oil = PRESET_FOODS.find((f) => f.id === 'f_olive_oil')!;

  const targets = { calories: 2500, carbs: 313, protein: 188, fat: 56 };
  const plan = generateMealPlan(targets, [rice, banana, chicken, yogurt, oil], 5);

  assert.equal(plan.meals.length, 5);
  assert.deepEqual([...MEAL_COUNT_OPTIONS], [2, 3, 4, 5, 6]);

  const riceGrams = plan.dailyFoodSummary.find((x) => x.food.id === 'c_white_rice')!.grams;
  const bananaGrams = plan.dailyFoodSummary.find((x) => x.food.id === 'c_banana')!.grams;
  const chickenGrams = plan.dailyFoodSummary.find((x) => x.food.id === 'p_chicken_breast')!.grams;
  const yogurtGrams = plan.dailyFoodSummary.find((x) => x.food.id === 'p_greek_yogurt')!.grams;

  assert.ok(riceGrams >= bananaGrams * 2.5, `Expected rice (${riceGrams}g) >> banana (${bananaGrams}g)`);
  assert.ok(bananaGrams <= 200, `Banana should stay realistic (<=200g), got ${bananaGrams}g`);
  assert.ok(chickenGrams > yogurtGrams, `Chicken (${chickenGrams}g) should exceed yogurt (${yogurtGrams}g)`);
  assert.ok(yogurtGrams <= 260, `Greek yogurt should stay realistic (<=260g), got ${yogurtGrams}g`);
  assert.ok(Math.abs(plan.totals.calories - targets.calories) <= 120);
});

test('gives heavy carb share to white/brown rice and puts sweet potato, potato, and bagel into breakfast', () => {
  const rice = PRESET_FOODS.find((f) => f.id === 'c_white_rice')!;
  const sweetPotato = PRESET_FOODS.find((f) => f.id === 'c_sweet_potato')!;
  const potato = PRESET_FOODS.find((f) => f.id === 'c_potato')!;
  const bagel = PRESET_FOODS.find((f) => f.id === 'c_bagel')!;
  const chicken = PRESET_FOODS.find((f) => f.id === 'p_chicken_breast')!;
  const oil = PRESET_FOODS.find((f) => f.id === 'f_olive_oil')!;

  const targets = { calories: 2300, carbs: 288, protein: 173, fat: 51 };
  const plan = generateMealPlan(
    targets,
    [rice, sweetPotato, potato, bagel, chicken, oil],
    3,
  );

  const riceCarbs = plan.dailyFoodSummary.find((x) => x.food.id === 'c_white_rice')!.carbs;
  const totalCarbs = plan.totals.carbs;
  assert.ok(
    riceCarbs / totalCarbs >= 0.55,
    `Expected white rice carbs (${riceCarbs}g) to dominate total carbs (${totalCarbs}g)`,
  );

  const breakfastIds = new Set(plan.meals[0].items.map((x) => x.food.id));
  assert.ok(breakfastIds.has('c_sweet_potato'), 'Sweet potato should be in breakfast');
  assert.ok(breakfastIds.has('c_potato'), 'Potato should be in breakfast');
  assert.ok(breakfastIds.has('c_bagel'), 'Bagel should be in breakfast');
  assert.ok(!breakfastIds.has('c_white_rice'), 'Rice should anchor lunch/dinner when breakfast has non-rice carbs');
});

test('generates balanced multi-food meal plan across 6 meals matching target calories and 5:3:2 macros', () => {
  const chosenIds = [
    'p_chicken_breast',
    'p_egg',
    'p_mackerel',
    'c_white_rice',
    'c_sweet_potato',
    'f_olive_oil',
    'f_avocado',
  ];
  const selectedFoods = PRESET_FOODS.filter((f) => chosenIds.includes(f.id));
  const targets = { calories: 2300, carbs: 288, protein: 173, fat: 51 };

  const plan = generateMealPlan(targets, selectedFoods, 6);

  assert.equal(plan.meals.length, 6);
  const usedIds = new Set(plan.dailyFoodSummary.map((item) => item.food.id));
  for (const id of chosenIds) {
    assert.ok(usedIds.has(id), `Expected selected food ${id} in meal plan`);
  }

  assert.ok(Math.abs(plan.totals.calories - targets.calories) <= 120, `Calorie delta too high: ${plan.diffCalories}`);
  assert.ok(Math.abs(plan.totals.carbs - targets.carbs) <= 18);
  assert.ok(Math.abs(plan.totals.protein - targets.protein) <= 15);
  assert.ok(Math.abs(plan.totals.fat - targets.fat) <= 10);

  // Verify no snack labels and every meal receives food like a proper meal
  for (const meal of plan.meals) {
    assert.ok(!meal.label.includes('간식'), `Unexpected snack label: ${meal.label}`);
    assert.ok(!meal.label.includes('야식'), `Unexpected late-night label: ${meal.label}`);
    assert.ok(meal.items.length >= 1, `Expected meal ${meal.label} to contain food items`);
  }

  // Verify 5 meals with rice + chicken splits rice & chicken across meals 2~5 like proper meals
  const plan5 = generateMealPlan(targets, selectedFoods, 5);
  assert.deepEqual(
    plan5.meals.map((m) => m.label),
    ['1끼 (아침)', '2끼', '3끼', '4끼', '5끼'],
  );
  for (let i = 1; i < 5; i++) {
    const ids = new Set(plan5.meals[i].items.map((x) => x.food.id));
    assert.ok(ids.has('c_white_rice'), `Expected rice in ${plan5.meals[i].label}`);
  }
});

test('supports custom foods via nutrition dictionary lookup and auto-infers category without manual selection', () => {
  const known = lookupCustomFoodNutrition('훈제오리');
  assert.equal(known.matched, true);
  assert.equal(known.category, 'protein');
  assert.ok(known.per100g.protein > 10);

  const autoCarb = createCustomFoodItem('수제 카레덮밥', null, 32, 8, 3, 'auto_c');
  assert.equal(autoCarb.category, 'carb');

  const autoFat = createCustomFoodItem('아몬드 쿠키', null, 12, 4, 28, 'auto_f');
  assert.equal(autoFat.category, 'fat');

  const customFood = createCustomFoodItem('수제 닭가슴살볼', null, 4, 20, 3, 'test1');
  assert.equal(customFood.category, 'protein');
  const rice = PRESET_FOODS.find((f) => f.id === 'c_white_rice')!;
  const oil = PRESET_FOODS.find((f) => f.id === 'f_olive_oil')!;

  const plan = generateMealPlan(
    { calories: 1800, carbs: 225, protein: 135, fat: 40 },
    [customFood, rice, oil],
    4,
  );
  assert.equal(plan.meals.length, 4);
  assert.ok(plan.dailyFoodSummary.some((item) => item.food.id === 'custom_test1'));
  assert.ok(Math.abs(plan.totals.calories - 1800) <= 100);
});

test('never mixes white rice and brown rice in the same meal across 2 to 6 meals', () => {
  const whiteRice = PRESET_FOODS.find((f) => f.id === 'c_white_rice')!;
  const brownRice = PRESET_FOODS.find((f) => f.id === 'c_brown_rice')!;
  const sweetPotato = PRESET_FOODS.find((f) => f.id === 'c_sweet_potato')!;
  const chicken = PRESET_FOODS.find((f) => f.id === 'p_chicken_breast')!;
  const oil = PRESET_FOODS.find((f) => f.id === 'f_olive_oil')!;
  const targets = { calories: 2300, carbs: 288, protein: 173, fat: 51 };

  for (const count of MEAL_COUNT_OPTIONS) {
    const plan = generateMealPlan(
      targets,
      [whiteRice, brownRice, sweetPotato, chicken, oil],
      count,
    );
    let mealsWithWhite = 0;
    let mealsWithBrown = 0;
    for (const meal of plan.meals) {
      const ids = new Set(meal.items.map((x) => x.food.id));
      const hasW = ids.has('c_white_rice');
      const hasB = ids.has('c_brown_rice');
      assert.ok(
        !(hasW && hasB),
        `${count} meals (${meal.label}) mixed white rice and brown rice together`,
      );
      if (hasW) mealsWithWhite++;
      if (hasB) mealsWithBrown++;
    }
    assert.ok(mealsWithWhite >= 1, `Expected white rice in at least 1 meal for ${count} meals`);
    assert.ok(mealsWithBrown >= 1, `Expected brown rice in at least 1 meal for ${count} meals`);
  }
});
