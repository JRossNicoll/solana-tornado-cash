#!/bin/bash


if [ $# -eq 0 ]; then
    echo "Usage: $0 <PROGRAM_ID>"
    echo "Example: $0 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
    exit 1
fi

NEW_PROGRAM_ID=$1
OLD_PROGRAM_ID="11111111111111111111111111111112"

echo "Updating Program ID from $OLD_PROGRAM_ID to $NEW_PROGRAM_ID"

sed -i "s/$OLD_PROGRAM_ID/$NEW_PROGRAM_ID/g" Anchor.toml
echo "✅ Updated Anchor.toml"

sed -i "s/PROGRAM_ID=.*/PROGRAM_ID=$NEW_PROGRAM_ID/g" .env
sed -i "s/REACT_APP_PROGRAM_ID=.*/REACT_APP_PROGRAM_ID=$NEW_PROGRAM_ID/g" .env
echo "✅ Updated .env"

sed -i "s/VITE_PROGRAM_ID=.*/VITE_PROGRAM_ID=$NEW_PROGRAM_ID/g" frontend/.env.local
echo "✅ Updated frontend/.env.local"

sed -i "s/declare_id!(\"$OLD_PROGRAM_ID\")/declare_id!(\"$NEW_PROGRAM_ID\")/g" programs/solana-tornado-cash/src/lib.rs
echo "✅ Updated programs/solana-tornado-cash/src/lib.rs"

echo ""
echo "🎉 All files updated with new Program ID: $NEW_PROGRAM_ID"
echo ""
echo "Next steps:"
echo "1. Run 'anchor build' to rebuild with new Program ID"
echo "2. Restart frontend dev server: 'cd frontend && npm run dev'"
echo "3. Test the application in your browser"
