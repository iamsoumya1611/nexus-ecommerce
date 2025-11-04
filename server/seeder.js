const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const sampleProducts = require('./data/sampleProducts');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const importData = async () => {
  try {
    // Clear existing products
    await Product.deleteMany();
    
    // Insert new products
    await Product.insertMany(sampleProducts);
    
    console.log('Sample products imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error importing sample products:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    
    console.log('Sample products destroyed successfully');
    process.exit();
  } catch (error) {
    console.error('Error destroying sample products:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}