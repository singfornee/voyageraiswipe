const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

// Initialize Firebase Admin with the service account key
const serviceAccount = require('../config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Function to import CSV data into Firestore with custom document ID
const importData = (filePath, collectionName, idField, isCompositeId = false) => {
  const collectionRef = db.collection(collectionName);

  // Check if the file is empty or not
  const fileContent = fs.readFileSync(filePath, 'utf8');
  if (fileContent.trim().length === 0) {
    console.log(`Skipping ${collectionName} import because the file ${filePath} is empty.`);
    return;
  }

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', async (row) => {
      console.log('Processing row:', row);

      // Clean up keys by removing any surrounding characters and whitespace
      const cleanedRow = {};
      Object.keys(row).forEach((key) => {
        const cleanedKey = key.replace(/^\W+|\W+$/g, '').trim(); // Remove non-word characters and trim
        cleanedRow[cleanedKey.toLowerCase()] = row[key]; // Convert all keys to lowercase
      });

      console.log('Cleaned data to be added:', cleanedRow);

      // Generate a composite ID if required
      let documentId;
      if (isCompositeId) {
        documentId = `${cleanedRow.user_id}_${cleanedRow.activity_id}`;
      } else {
        documentId = cleanedRow[idField] ? cleanedRow[idField].toString().trim() : undefined;
      }

      if (!documentId) {
        console.error(`ID field (${idField}) is undefined or missing. Row:`, row);
        return;
      }

      try {
        // Field validation based on the collection name
        let isValid = true;

        // Validate fields for activities collection
        if (collectionName === 'activities') {
          const { activity_id, attraction_id, activity_name, activity_full_name, activity_description, activities_keywords, min_duration, max_duration, price, currency } = cleanedRow;
          if (!activity_id || !attraction_id || !activity_name || !activity_full_name || !activity_description || !min_duration || !max_duration || !price || !currency) {
            console.error('Missing required fields for activities:', cleanedRow);
            isValid = false;
          }
        }
        // Validate fields for attractions collection
        else if (collectionName === 'attractions') {
          const { attraction_id, attraction_name, attraction_category, attraction_subcategory, location_city, location_country, opening_hour, latitude, longitude } = cleanedRow;
          if (!attraction_id || !attraction_name || !attraction_category || !location_city || !location_country || !latitude || !longitude) {
            console.error('Missing required fields for attractions:', cleanedRow);
            isValid = false;
          }
        }
        // Validate fields for categories collection
        else if (collectionName === 'categories') {
          const { category_id, core_category, description } = cleanedRow;
          if (!category_id || !core_category || !description) {
            console.error('Missing required fields for categories:', cleanedRow);
            isValid = false;
          }
        }
        // Validate fields for subcategories collection
        else if (collectionName === 'subcategories') {
          const { subcategory_id, subcategories, core_category_id, description } = cleanedRow;
          if (!subcategory_id || !subcategories || !core_category_id || !description) {
            console.error('Missing required fields for subcategories:', cleanedRow);
            isValid = false;
          }
        }
        else if (collectionName === 'tags') {
          const { tag_type, tag_value, description } = cleanedRow;
        if (!tag_type || !tag_value || !description) {
          console.error('Missing required fields:', cleanedRow);
          isValid = false;;
          }
        }

        // Validate fields for userActivities collection
        else if (collectionName === 'userActivities') {
          const { activity_id, user_id, activity_full_name, activity_description, attraction_id, status, timestamp } = cleanedRow;
          if (!activity_id || !user_id || !activity_full_name || !activity_description || !attraction_id || !status || !timestamp) {
            console.error('Missing required fields for userActivities:', cleanedRow);
            isValid = false;
          }
        }

        // Validate fields for userPreferences collection
        else if (collectionName === 'userPreferences') {
          const { user_id, keywords } = cleanedRow;
          if (!user_id || !keywords) {
            console.error('Missing required fields for userPreferences:', cleanedRow);
            isValid = false;
          }
        }


        if (!isValid) {
          return; // Skip this row if it's missing required fields
        }

        // Parse the timestamp if it exists and convert to Firestore Timestamp
        let parsedTimestamp;
        if (cleanedRow.timestamp) {
          const date = new Date(cleanedRow.timestamp);
          if (isNaN(date.getTime())) {
            console.error('Invalid date format in timestamp:', cleanedRow.timestamp);
            return;
          }
          parsedTimestamp = admin.firestore.Timestamp.fromDate(date);
        }

        await collectionRef.doc(documentId).set({
          ...cleanedRow,
          timestamp: parsedTimestamp || admin.firestore.FieldValue.serverTimestamp(), // Use parsed or server timestamp
        });
        console.log(`Document added to ${collectionName} with ID: ${documentId}`);
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    })
    .on('end', () => {
      console.log(`CSV file ${filePath} successfully processed and data added to Firestore collection ${collectionName}`);
    });
};

// Example usage
importData('../data/activities.csv', 'activities', 'activity_id');
importData('../data/attractions.csv', 'attractions', 'attraction_id');
importData('../data/categories.csv', 'categories', 'category_id');
importData('../data/subcategories.csv', 'subcategories', 'subcategory_id');
importData('../data/tags.csv', 'tags', 'tag_id'); // Importing tags collection
importData('../data/userActivities.csv', 'userActivities', 'activity_id', true); // Use composite ID for userActivities
importData('../data/userPreferences.csv', 'userPreferences', 'user_id');

