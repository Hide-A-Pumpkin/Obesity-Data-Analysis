import pandas as pd

df = pd.read_csv('CleanObesityDataSet.csv')

# Select the required columns
selected_columns = ['FCVC','NCP','BMI','FAF','TUE','BMI','NObeyesdad']
df = df[selected_columns]

def transform_category(category):
    if category in ['Insufficient_Weight']:
        return 'insufficient_weight'
    elif category in ['Normal_Weight']:
        return 'normal_weight'
    elif category in ['Overweight_Level_I', 'Overweight_Level_II']:
        return 'overweight'
    elif category in ['Obesity_Type_I', 'Obesity_Type_II', 'Obesity_Type_III']:
        return 'obesity'
    else:
        return category  # In case there are other categories not mentioned

# gender_mapping = {'Male': 0, 'Female': 1}
# df['Gender'] = df['Gender'].map(gender_mapping)

# # Transform 'caec' column
# caec_mapping = {'Sometimes': 0, 'Frequently': 1, 'Always': 2}
# df['CAEC'] = df['CAEC'].map(caec_mapping)

# Apply the transformation
df['NObeyesdad'] = df['NObeyesdad'].apply(transform_category)

# Optionally, save the transformed DataFrame to a new CSV
df.to_csv('transformed_data.csv', index=False)
