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

  const errors = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', async (row) => {
      console.log('Processing row:', row);

      // Clean up keys by removing any surrounding characters and whitespace
      const cleanedRow = {};
      Object.keys(row).forEach((key) => {
        const cleanedKey = key.replace(/^\W+|\W+$/g, '').trim(); // Remove non-word characters and trim
        cleanedRow[cleanedKey] = row[key]; // Keep original key casing as per CSV
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

        switch (collectionName) {
          case 'activities':
            const {
              activity_id,
              attraction_id,
              activity_name,
              activity_full_name,
              activity_description,
              activities_keywords,
              min_duration,
              max_duration,
              price,
              currency,
            } = cleanedRow;
            if (
              !activity_id ||
              !attraction_id ||
              !activity_name ||
              !activity_full_name ||
              !activity_description ||
              !min_duration ||
              !max_duration ||
              !price ||
              !currency
            ) {
              console.error('Missing required fields for activities:', cleanedRow);
              isValid = false;
            }
            break;

          case 'attractions':
            const {
              attraction_id: attr_id,
              attraction_name,
              attraction_category,
              attraction_subcategory,
              location_city,
              location_country,
              opening_hour,
              latitude,
              longitude,
            } = cleanedRow;
            if (
              !attr_id ||
              !attraction_name ||
              !attraction_category ||
              !location_city ||
              !location_country ||
              !latitude ||
              !longitude
            ) {
              console.error('Missing required fields for attractions:', cleanedRow);
              isValid = false;
            }
            break;

          case 'categories':
            const { category_id, core_category, description } = cleanedRow;
            if (!category_id || !core_category || !description) {
              console.error('Missing required fields for categories:', cleanedRow);
              isValid = false;
            }
            break;

          case 'subcategories':
            const {
              subcategory_id,
              subcategories,
              core_category_id,
              sub_description,
            } = cleanedRow;
            if (!subcategory_id || !subcategories || !core_category_id || !sub_description) {
              console.error('Missing required fields for subcategories:', cleanedRow);
              isValid = false;
            }
            break;

          case 'tags':
            const { tag_type, tag_value, tag_description } = cleanedRow;
            if (!tag_type || !tag_value || !tag_description) {
              console.error('Missing required fields for tags:', cleanedRow);
              isValid = false;
            }
            break;

            case 'userActivities': {
              const {
                  activity_id: user_activity_id,
                  user_id,
                  activity_full_name: user_activity_full_name,
                  activity_description: user_activity_description,
                  attraction_id: user_attraction_id,
                  status,
                  timestamp,
                  imageUrl, // Ensure this is included
              } = cleanedRow;
          
              const requiredFields = {
                  user_activity_id,
                  user_id,
                  user_activity_full_name,
                  user_activity_description,
                  user_attraction_id,
                  status,
                  timestamp
              };
          
              const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);
          
              if (missingFields.length > 0) {
                  console.error('Missing required fields for userActivities:', missingFields.join(', '), cleanedRow);
                  isValid = false;
                  break;
              }
          
              const finalImageUrl = imageUrl || 'https://via.placeholder.com/180'; // Default placeholder
          
              await collectionRef.doc(`${user_id}_${user_activity_id}`).set({
                  activity_id: user_activity_id,
                  user_id,
                  activity_full_name: user_activity_full_name,
                  activity_description: user_activity_description,
                  attraction_id: user_attraction_id,
                  status,
                  timestamp: admin.firestore.Timestamp.fromDate(new Date(timestamp)),
                  imageUrl: finalImageUrl, // Make sure this is being set
              });
          
              console.log(`Document added to userActivities with ID: ${user_id}_${user_activity_id}`);
              break;
          }          
          
          case 'userPreferences':
            const {
              user_id: pref_user_id,
              displayName,
              profileIcon,
              preferences,
              updatedAt,
            } = cleanedRow;
            if (!pref_user_id || !preferences || !updatedAt) {
              console.error('Missing required fields for userPreferences:', cleanedRow);
              isValid = false;
            }
            break;

          default:
            console.error('Unknown collection name:', collectionName);
            isValid = false;
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
