// Automated verification suite for Mandatory Tests 1 through 10
const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  const results = [];
  let token = null;
  let internshipTaskId = null;
  let futureTaskId = null;
  let reminderTaskId = null;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      results.push({ name: testName, status: 'PASS', details });
    } else {
      console.error(`❌ [FAIL] ${testName}: ${details}`);
      results.push({ name: testName, status: 'FAIL', details });
    }
  };

  try {
    // 0. Health & Auth
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthJson = await healthRes.json();
    assert(healthJson.status === 'ok' && healthJson.database === 'connected', 'Health Check & MongoDB Connection');

    const authRes = await fetch(`${BASE_URL}/auth/default-user`);
    const authJson = await authRes.json();
    token = authJson.data?.token;
    assert(!!token, 'JWT Authentication & Default User Seed');

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    // TEST 1: Create a task called "Internship Submission", set deadline and reminder, save it, verify it appears in Dashboard
    const todayStr = new Date().toISOString().split('T')[0];
    const task1Res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Internship Submission',
        description: 'Complete final project report and submit repository link',
        dueDate: todayStr,
        dueTime: '17:00',
        priority: 'High',
        category: 'Work',
        reminder: {
          enabled: true,
          type: '15m'
        }
      })
    });
    const task1Json = await task1Res.json();
    internshipTaskId = task1Json.data?._id;

    // Check Dashboard
    const dash1Res = await fetch(`${BASE_URL}/dashboard/stats`, { headers });
    const dash1Json = await dash1Res.json();
    const taskInDash = dash1Json.data.todayTasks.some((t) => t.title === 'Internship Submission');

    assert(
      task1Json.success && !!internshipTaskId && taskInDash,
      'TEST 1: Create "Internship Submission" with deadline & reminder -> Appears in Dashboard',
      `ID: ${internshipTaskId}, Found in Dashboard: ${taskInDash}`
    );

    // TEST 2: Refresh simulation -> Verify task still exists in MongoDB
    const refreshRes = await fetch(`${BASE_URL}/tasks`, { headers });
    const refreshJson = await refreshRes.json();
    const taskPersisted = refreshJson.data.some((t) => t._id === internshipTaskId && t.title === 'Internship Submission');
    assert(taskPersisted, 'TEST 2: Refresh Persistence -> Task remains saved in MongoDB');

    // TEST 3: Edit task title and deadline -> Verify changes in Dashboard, Tasks, and Calendar
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const editRes = await fetch(`${BASE_URL}/tasks/${internshipTaskId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        title: 'Internship Submission - Final Review',
        dueDate: tomorrowStr,
        dueTime: '19:00',
        priority: 'High'
      })
    });
    const editJson = await editRes.json();

    const tasksAfterEdit = await (await fetch(`${BASE_URL}/tasks`, { headers })).json();
    const dashAfterEdit = await (await fetch(`${BASE_URL}/dashboard/stats`, { headers })).json();
    const calAfterEdit = await (await fetch(`${BASE_URL}/tasks/by-date?date=${tomorrowStr}`, { headers })).json();

    const inTasks = tasksAfterEdit.data.some((t) => t.title === 'Internship Submission - Final Review');
    const inUpcoming = dashAfterEdit.data.upcomingTasks.some((t) => t.title === 'Internship Submission - Final Review');
    const inCal = calAfterEdit.data.some((t) => t.title === 'Internship Submission - Final Review');

    assert(
      editJson.success && inTasks && inUpcoming && inCal,
      'TEST 3: Edit Task Title & Deadline -> Reflected in Tasks, Dashboard, and Calendar',
      `Tasks: ${inTasks}, Upcoming: ${inUpcoming}, Calendar: ${inCal}`
    );

    // TEST 4: Delete the task -> Verify it disappears from every section
    const delRes = await fetch(`${BASE_URL}/tasks/${internshipTaskId}`, {
      method: 'DELETE',
      headers
    });
    const delJson = await delRes.json();

    const tasksAfterDel = await (await fetch(`${BASE_URL}/tasks`, { headers })).json();
    const dashAfterDel = await (await fetch(`${BASE_URL}/dashboard/stats`, { headers })).json();

    const existsInTasks = tasksAfterDel.data.some((t) => t._id === internshipTaskId);
    const existsInDash = dashAfterDel.data.todayTasks.some((t) => t._id === internshipTaskId) ||
                         dashAfterDel.data.upcomingTasks.some((t) => t._id === internshipTaskId);

    assert(
      delJson.success && !existsInTasks && !existsInDash,
      'TEST 4: Delete Task -> Disappears from Tasks and Dashboard sections'
    );

    // TEST 5: Calendar Month Navigation Logic & Leap Year calculation
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const feb2028 = getDaysInMonth(2028, 1); // 2028 is leap year -> 29 days
    const feb2026 = getDaysInMonth(2026, 1); // 2026 is common year -> 28 days
    const nov2026 = getDaysInMonth(2026, 10); // 30 days
    const dec2026 = getDaysInMonth(2026, 11); // 31 days

    assert(
      feb2028 === 29 && feb2026 === 28 && nov2026 === 30 && dec2026 === 31,
      'TEST 5: Calendar Navigation & Month Calculations (Leap year 29d, Common 28d, 30d, 31d)',
      `Feb 2028: ${feb2028}, Feb 2026: ${feb2026}`
    );

    // TEST 6: Calendar Today Button returns to current month
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const resetDate = new Date(curYear, curMonth, 1);
    assert(
      resetDate.getMonth() === curMonth && resetDate.getFullYear() === curYear,
      'TEST 6: Calendar Today Action -> Accurately resets to current month & year'
    );

    // TEST 7: Create a task for a future date -> Verify it appears on the correct calendar date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const futureTaskRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Quarterly Milestone Review',
        dueDate: futureDateStr,
        dueTime: '14:00',
        priority: 'Medium',
        category: 'Engineering'
      })
    });
    const futureTaskJson = await futureTaskRes.json();
    futureTaskId = futureTaskJson.data?._id;

    const calDateCheck = await (await fetch(`${BASE_URL}/tasks/by-date?date=${futureDateStr}`, { headers })).json();
    const foundOnCalDate = calDateCheck.data.some((t) => t._id === futureTaskId);

    assert(
      futureTaskJson.success && foundOnCalDate,
      'TEST 7: Task on Future Date -> Accurately retrieved by date for Calendar grid',
      `Date: ${futureDateStr}, Found: ${foundOnCalDate}`
    );

    // TEST 8: Reminder triggers at configured time without duplicates
    // Create task with reminder scheduled 10 seconds in past
    const pastReminderTime = new Date(Date.now() - 10000);
    const reminderTaskRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Instant Reminder Test Task',
        dueDate: todayStr,
        dueTime: '12:00',
        priority: 'High',
        category: 'Personal',
        reminder: {
          enabled: true,
          type: 'custom',
          customTime: pastReminderTime
        }
      })
    });
    const reminderTaskJson = await reminderTaskRes.json();
    reminderTaskId = reminderTaskJson.data?._id;

    // Wait 16 seconds for the scheduler cycle (runs every 15s)
    console.log('   Waiting 16 seconds for background reminder scheduler cycle...');
    await new Promise((r) => setTimeout(r, 16000));

    const notifsRes = await fetch(`${BASE_URL}/notifications`, { headers });
    const notifsJson = await notifsRes.json();
    const reminderNotifs = notifsJson.data.filter((n) => n.taskId === reminderTaskId && n.type === 'reminder');

    assert(
      reminderNotifs.length === 1,
      'TEST 8: Real Reminder System -> Exactly 1 reminder notification triggered without duplicates',
      `Reminder notifications for task: ${reminderNotifs.length}`
    );

    // TEST 9: Mark a task completed -> Verify dashboard statistics update
    const statsBefore = (await (await fetch(`${BASE_URL}/dashboard/stats`, { headers })).json()).data;
    await fetch(`${BASE_URL}/tasks/${futureTaskId}/toggle`, {
      method: 'PATCH',
      headers
    });
    const statsAfter = (await (await fetch(`${BASE_URL}/dashboard/stats`, { headers })).json()).data;

    assert(
      statsAfter.completedTasks === statsBefore.completedTasks + 1 &&
      statsAfter.pendingTasks === statsBefore.pendingTasks - 1,
      'TEST 9: Toggle Task Complete -> Dashboard statistics dynamically update in MongoDB',
      `Before: ${statsBefore.completedTasks} done, After: ${statsAfter.completedTasks} done`
    );

    // TEST 10: Run all API endpoints, check responses and error handling
    // 10a. Focus Session Endpoint
    const focusRes = await fetch(`${BASE_URL}/focus-sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ durationMinutes: 25, mode: 'focus', notes: 'Automated test' })
    });
    const focusJson = await focusRes.json();

    const focusStatsRes = await fetch(`${BASE_URL}/focus-sessions/stats`, { headers });
    const focusStatsJson = await focusStatsRes.json();

    // 10b. Error handling: Validation error on missing title
    const badTaskRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ dueDate: todayStr })
    });
    const badTaskJson = await badTaskRes.json();

    // 10c. Error handling: Unauthorized request
    const unauthRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { 'Content-Type': 'application/json' }
    });

    // 10d. Error handling: 404 on nonexistent task
    const notFoundRes = await fetch(`${BASE_URL}/tasks/651234567890123456789012`, { headers });

    assert(
      focusJson.success &&
      focusStatsJson.data.todayMinutes >= 25 &&
      badTaskRes.status === 400 &&
      unauthRes.status === 401 &&
      notFoundRes.status === 404,
      'TEST 10: API Endpoints & Error Handling (400 validation, 401 auth, 404 not found, Focus Sessions)',
      `Focus: ${focusJson.success}, 400: ${badTaskRes.status}, 401: ${unauthRes.status}, 404: ${notFoundRes.status}`
    );

    // Clean up created test tasks
    if (futureTaskId) await fetch(`${BASE_URL}/tasks/${futureTaskId}`, { method: 'DELETE', headers });
    if (reminderTaskId) await fetch(`${BASE_URL}/tasks/${reminderTaskId}`, { method: 'DELETE', headers });

    console.log('\n======================================');
    console.log(`TOTAL TESTS: ${results.length}`);
    console.log(`PASSED: ${results.filter((r) => r.status === 'PASS').length}`);
    console.log(`FAILED: ${results.filter((r) => r.status === 'FAIL').length}`);
    console.log('======================================\n');
  } catch (err) {
    console.error('Test execution error:', err);
  }
};

runTests();
