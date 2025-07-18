const ContactInfo = () => {
  const contacts = [
    { type: 'HOTLINE hỗ trợ', value: '19002224 (9:00 - 22:00)', icon: '📞' },
    { type: 'Email', value: 'hotro@absolutecinema.vn', icon: '✉️' },
    { type: 'Câu hỏi thường gặp', value: '', icon: '❓' }
  ];

  return (
    <div className="space-y-4">
      {contacts.map((contact, index) => (
        <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{contact.icon}</span>
            <div>
              <div className="font-medium text-gray-700">{contact.type}:</div>
              {contact.value && <div className="text-sm text-gray-600">{contact.value}</div>}
            </div>
          </div>
          <span className="text-gray-400">›</span>
        </div>
      ))}
    </div>
  );
};
export default ContactInfo;