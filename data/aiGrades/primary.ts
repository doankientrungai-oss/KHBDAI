export interface AICodeItem {
  code: string;
  topicId: string;
  topicName: string;
  domainId: 'NLa' | 'NLb' | 'NLc' | 'NLd';
  domainName: string;
  contentTopic: string;
  requirement: string;
  isExtended?: boolean;
}

export interface AIGradeFramework {
  grade: string;
  level: 'TH' | 'THCS' | 'THPT';
  summary: string;
  codes: AICodeItem[];
}

export const primaryGradeData: Record<string, AIGradeFramework> = {
  '1': {
    grade: '1',
    level: 'TH',
    summary: 'Bước đầu làm quen với AI, nhận biết cảm xúc con người và AI, trải nghiệm công cụ đơn giản.',
    codes: [
      {
        code: '1.A1.1',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Con người có cảm xúc, AI thì không',
        requirement: 'Nêu được ví dụ về một số cảm xúc quen thuộc của con người (vui, buồn, giận dữ, sợ hãi, ngạc nhiên,…) qua các tình huống gần gũi trong cuộc sống và bước đầu nhận ra rằng con người có cảm xúc còn AI thì không.'
      },
      {
        code: '1.A1.2',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Con người có cảm xúc, AI thì không',
        requirement: 'Nêu được rằng AI có thể mô phỏng hoặc nhận diện cảm xúc của con người, chứ không trải nghiệm cảm xúc như con người.'
      },
      {
        code: '1.A1.3',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI thể hiện cảm xúc do con người lập trình',
        requirement: 'Nêu được rằng việc AI thể hiện cảm xúc (ví dụ: cười, buồn, ngạc nhiên, tức giận trên màn hình hoặc qua giọng nói) là do con người lập trình hoặc thiết kế trước.'
      },
      {
        code: '1.A1.4',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI thể hiện cảm xúc do con người lập trình',
        requirement: 'Nêu được một số ví dụ minh họa (như robot cười khi người dùng kể chuyện vui, hoặc trợ lí ảo nói “Tôi rất vui được giúp bạn”), và giải thích được rằng những biểu hiện này chỉ là phản ứng được lập trình sẵn.'
      },
      {
        code: '1.A2.1',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Ý nghĩa cảm xúc mà AI thể hiện',
        requirement: 'Nêu được các cách mà AI thể hiện cảm xúc qua hình ảnh, giọng nói hoặc hành vi (ví dụ: biểu tượng khuôn mặt vui, giọng nói thân thiện, hoặc lời chào dễ thương).'
      },
      {
        code: '1.A2.2',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Nhận diện AI trong cuộc sống',
        requirement: 'Nhận biết và kể tên được một số sản phẩm hoặc thiết bị có sử dụng trí tuệ nhân tạo (ví dụ: loa thông minh, điện thoại có trợ lí ảo, robot hút bụi, xe tự lái, camera nhận diện khuôn mặt, ứng dụng dịch ngôn ngữ…).'
      },
      {
        code: '1.A2.3',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Nhận diện AI trong cuộc sống',
        requirement: 'Mô tả được công dụng chính của từng sản phẩm và cách AI giúp sản phẩm hoạt động thông minh hơn (ví dụ: loa thông minh hiểu lệnh bằng giọng nói; robot hút bụi tự tìm đường và tránh chướng ngại vật).'
      },
      {
        code: '1.A2.MR1',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Ý nghĩa cảm xúc mà AI thể hiện',
        requirement: 'Nêu được rằng những biểu hiện này giúp AI giao tiếp tự nhiên hơn với con người, khiến người dùng cảm thấy thoải mái, gần gũi và dễ hợp tác hơn.',
        isExtended: true
      },
      {
        code: '1.B1.1',
        topicId: 'B1',
        topicName: 'Các khía cạnh đạo đức của AI',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Việc làm tốt và việc làm xấu',
        requirement: 'Nêu được một số hành vi sử dụng AI có thể gây hại cho người khác.'
      },
      {
        code: '1.B3.1',
        topicId: 'B3',
        topicName: 'Nguyên tắc đạo đức và trách nhiệm xã hội',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Máy thông minh làm việc tốt',
        requirement: 'Nhận biết được rằng không được phép sử dụng AI với mục đích làm hại người khác.'
      },
      {
        code: '1.B3.2',
        topicId: 'B3',
        topicName: 'Nguyên tắc đạo đức và trách nhiệm xã hội',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Máy thông minh làm việc tốt',
        requirement: 'Nêu được ví dụ về việc con người sử dụng AI đúng cách, vì mục đích tốt đẹp.'
      },
      {
        code: '1.C1.1',
        topicId: 'C1',
        topicName: 'Đặc điểm chính của AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Nhận biết AI và ứng dụng AI',
        requirement: 'Nhận biết được AI trong một số ví dụ cụ thể và đơn giản về AI.'
      },
      {
        code: '1.C1.2',
        topicId: 'C1',
        topicName: 'Đặc điểm chính của AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Nhận biết AI và ứng dụng AI',
        requirement: 'Nhận diện được một số công cụ AI quen thuộc và phổ biến trên điện thoại hoặc máy tính bảng (ví dụ: trợ lí ảo, nhận diện khuôn mặt, …).'
      },
      {
        code: '1.C1.3',
        topicId: 'C1',
        topicName: 'Đặc điểm chính của AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Chức năng và công cụ AI',
        requirement: 'Nhận biết được các thiết bị thông minh có các bộ phận giống với bộ phận của con người (ví dụ: camera là “mắt” và micro là “tai” của các thiết bị đó).'
      },
      {
        code: '1.C1.4',
        topicId: 'C1',
        topicName: 'Đặc điểm chính của AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Chức năng và công cụ AI',
        requirement: 'Nhận biết được AI có khả năng hiểu các mệnh lệnh đơn giản của con người, trò chuyện theo kịch bản định sẵn.'
      },
      {
        code: '1.C1.MR1',
        topicId: 'C1',
        topicName: 'Đặc điểm chính của AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Chức năng và công cụ AI',
        requirement: 'Nhận biết được AI có khả năng xử lí hình ảnh nhận được để nhận diện các đồ vật.',
        isExtended: true
      },
      {
        code: '1.C1.MR2',
        topicId: 'C1',
        topicName: 'Đặc điểm chính của AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Chức năng và công cụ AI',
        requirement: 'Nhận biết được AI có khả năng xử lí âm thanh để phân biệt các loại âm thanh khác nhau.',
        isExtended: true
      },
      {
        code: '1.D1.1',
        topicId: 'D1',
        topicName: 'Nhận diện và hình thành giải pháp',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Máy thông minh học từ ví dụ',
        requirement: 'Nêu được ví dụ về một tình huống mà AI “học” từ hình ảnh hoặc thông tin do con người cung cấp (ví dụ: AI học nhận biết con mèo, quả táo…).'
      },
      {
        code: '1.D1.MR1',
        topicId: 'D1',
        topicName: 'Nhận diện và hình thành giải pháp',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Máy thông minh học từ ví dụ',
        requirement: 'Biết được rằng để AI trả lời đúng cần có nhiều ví dụ đúng và khác nhau để AI học.',
        isExtended: true
      },
      {
        code: '1.D2.1',
        topicId: 'D2',
        topicName: 'Cấu trúc và tương tác, cải tiến hệ thống',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Nhiều loại máy thông minh',
        requirement: 'Nhận biết được rằng có loại máy thông minh chỉ làm được một việc (như nhận biết hình ảnh), có loại có thể làm nhiều việc khác nhau (như lắng nghe - trả lời, thực hiện theo lệnh…).'
      },
      {
        code: '1.D2.2',
        topicId: 'D2',
        topicName: 'Cấu trúc và tương tác, cải tiến hệ thống',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Nhiều loại máy thông minh',
        requirement: 'Xếp được một số máy thông minh vào hai nhóm: nhóm chỉ làm được một việc và nhóm làm được nhiều việc khác nhau.'
      }
    ]
  },
  '2': {
    grade: '2',
    level: 'TH',
    summary: 'Khi nào nên/không nên dùng AI, con người kiểm soát, AI trong gia đình, sự công bằng và tôn trọng bản quyền.',
    codes: [
      {
        code: '2.A1.1',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Khi nào nên và không nên dùng AI',
        requirement: 'Trình bày được một số tình huống trong cuộc sống mà AI có thể hỗ trợ con người hiệu quả, chẳng hạn như: sử dụng AI để dịch ngôn ngữ, tìm kiếm thông tin nhanh, phát hiện lỗi chính tả, hoặc điều khiển thiết bị thông minh trong nhà, …'
      },
      {
        code: '2.A1.2',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Khi nào nên và không nên dùng AI',
        requirement: 'Trình bày được một số tình huống trong cuộc sống mà không nên hoặc cần thận trọng khi sử dụng AI, ví dụ: khi AI có thể làm lộ thông tin cá nhân (như khuôn mặt, địa chỉ, dữ liệu giọng nói); khi AI thay thế hoàn toàn con người, dẫn đến sự thiếu trách nhiệm.'
      },
      {
        code: '2.A1.3',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI làm việc, con người kiểm soát',
        requirement: 'Nêu được ví dụ cụ thể về tình huống cần con người giám sát AI (ví dụ: người lái xe vẫn cần quan sát khi xe tự lái hoạt động; bác sĩ cần kiểm tra lại kết quả do AI gợi ý).'
      },
      {
        code: '2.A1.4',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI làm việc, con người kiểm soát',
        requirement: 'Nêu được ví dụ cụ thể về thái độ đúng đắn khi sử dụng AI: biết tin tưởng vào công nghệ ở mức hợp lý, nhưng vẫn có trách nhiệm và sự kiểm soát của con người.'
      },
      {
        code: '2.A2.1',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI trong gia đình',
        requirement: 'Nêu được một số thiết bị hoặc ứng dụng trong gia đình có sử dụng AI, chẳng hạn như loa thông minh, robot hút bụi, máy điều hoà tự động điều chỉnh nhiệt độ.'
      },
      {
        code: '2.A2.2',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI hỗ trợ mọi người',
        requirement: 'Nhận biết và kể tên được các thành viên trong gia đình mà AI có thể hỗ trợ.'
      },
      {
        code: '2.A2.MR1',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI trong gia đình',
        requirement: 'Thực hành sử dụng một số thiết bị hoặc ứng dụng có sử dụng AI với sự giám sát, hỗ trợ của giáo viên.',
        isExtended: true
      },
      {
        code: '2.A2.MR2',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI trong gia đình',
        requirement: 'Nêu được rằng không được sử dụng thiết bị hoặc ứng dụng có sử dụng AI mà không có sự giám sát của người lớn.',
        isExtended: true
      },
      {
        code: '2.A2.MR3',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI hỗ trợ mọi người',
        requirement: 'Nêu được rằng mục tiêu của AI trong bối cảnh gia đình là giúp ích cho cuộc sống của các thành viên tiện nghi hơn, an toàn hơn và có nhiều thời gian cho nhau hơn.',
        isExtended: true
      },
      {
        code: '2.A3.1',
        topicId: 'A3',
        topicName: 'Công dân trong kỉ nguyên AI',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Con người dạy AI qua tương tác',
        requirement: 'Nhận biết được rằng mỗi lần con người nói chuyện, đặt câu hỏi, tìm kiếm, hoặc đưa ra lựa chọn với các hệ thống AI (như trợ lí ảo, chatbot, ứng dụng gợi ý video hoặc nhạc) thì AI có thể ghi nhận dữ liệu để học hỏi cách con người suy nghĩ và phản hồi.'
      },
      {
        code: '2.A3.MR1',
        topicId: 'A3',
        topicName: 'Công dân trong kỉ nguyên AI',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Con người dạy AI qua tương tác',
        requirement: 'Nêu được rằng con người có vai trò quan trọng trong việc “dạy” AI thông qua cách tương tác: khi con người đưa ra phản hồi đúng, lịch sự, và có trách nhiệm, AI có thể học được các mẫu thông tin tích cực; ngược lại, nếu dữ liệu sai lệch hoặc thiếu chính xác, AI có thể học sai.',
        isExtended: true
      },
      {
        code: '2.B1.1',
        topicId: 'B1',
        topicName: 'Các khía cạnh đạo đức của AI',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Sự đối xử không công bằng',
        requirement: 'Nhận biết được rằng AI đôi khi có thể thiên kiến, tức là đối xử không công bằng với một số nhóm người.'
      },
      {
        code: '2.B1.MR1',
        topicId: 'B1',
        topicName: 'Các khía cạnh đạo đức của AI',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Sự đối xử không công bằng',
        requirement: 'Nêu được ví dụ về các tình huống thể hiện sự thiên kiến của AI.',
        isExtended: true
      },
      {
        code: '2.B1.MR2',
        topicId: 'B1',
        topicName: 'Các khía cạnh đạo đức của AI',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Sự đối xử không công bằng',
        requirement: 'Giải thích được rằng nếu dữ liệu chưa đa dạng hoặc chưa công bằng thì AI có thể học theo cách thiên vị.',
        isExtended: true
      },
      {
        code: '2.B3.1',
        topicId: 'B3',
        topicName: 'Nguyên tắc đạo đức và trách nhiệm xã hội',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Của bạn và của tớ',
        requirement: 'Kể được tên một số thứ là của riêng em và một số thứ là của người khác.'
      },
      {
        code: '2.B3.2',
        topicId: 'B3',
        topicName: 'Nguyên tắc đạo đức và trách nhiệm xã hội',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Của bạn và của tớ',
        requirement: 'Nêu được ví dụ về quyền sở hữu đối với sản phẩm do con người hoặc AI tạo ra.'
      },
      {
        code: '2.B3.MR1',
        topicId: 'B3',
        topicName: 'Nguyên tắc đạo đức và trách nhiệm xã hội',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Của bạn và của tớ',
        requirement: 'Phân biệt được thứ của mình với thứ của người khác trong một vài tình huống đơn giản.',
        isExtended: true
      },
      {
        code: '2.B3.MR2',
        topicId: 'B3',
        topicName: 'Nguyên tắc đạo đức và trách nhiệm xã hội',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Của bạn và của tớ',
        requirement: 'Nêu được rằng muốn dùng thứ của người khác thì phải hỏi và được người đó đồng ý.',
        isExtended: true
      },
      {
        code: '2.C1.1',
        topicId: 'C1',
        topicName: 'Đặc điểm chính của AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Cách AI học và học liệu của AI',
        requirement: 'Giải thích được “dữ liệu” là những ví dụ (hình ảnh, âm thanh) mà con người dùng để dạy cho AI.'
      },
      {
        code: '2.C1.MR1',
        topicId: 'C1',
        topicName: 'Đặc điểm chính của AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Cách AI học và học liệu của AI',
        requirement: 'So sánh được ở mức độ cơ bản giữa cách học của con người và AI.',
        isExtended: true
      },
      {
        code: '2.C3.1',
        topicId: 'C3',
        topicName: 'Công nghệ AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Sơ lược cách AI phân loại đồ vật',
        requirement: 'Nhận biết được rằng AI có thể phân loại.'
      },
      {
        code: '2.C3.2',
        topicId: 'C3',
        topicName: 'Công nghệ AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Sơ lược cách AI phân loại đồ vật',
        requirement: 'Nêu được rằng AI có thể phân loại sai.'
      },
      {
        code: '2.C3.MR1',
        topicId: 'C3',
        topicName: 'Công nghệ AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Sơ lược cách AI phân loại đồ vật',
        requirement: 'Quan sát được thao tác phân loại đồ vật do giáo viên thực hiện trên thiết bị điện tử hoặc mô phỏng; từ kết quả quan sát đó, so sánh được cách AI phân loại với cách con người phân loại.',
        isExtended: true
      },
      {
        code: '2.D1.1',
        topicId: 'D1',
        topicName: 'Nhận diện và hình thành giải pháp',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Máy thông minh giúp giải quyết vấn đề quanh em',
        requirement: 'Nêu được một số vấn đề đơn giản, gần gũi trong đời sống có thể áp dụng AI để giải quyết.'
      },
      {
        code: '2.D1.2',
        topicId: 'D1',
        topicName: 'Nhận diện và hình thành giải pháp',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Ý tưởng máy thông minh',
        requirement: 'Nêu được một số ý tưởng máy thông minh.'
      },
      {
        code: '2.D1.MR1',
        topicId: 'D1',
        topicName: 'Nhận diện và hình thành giải pháp',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Ý tưởng máy thông minh',
        requirement: 'Nêu một số ví dụ phù hợp để “dạy” AI trong một tình huống cụ thể.',
        isExtended: true
      },
      {
        code: '2.D2.1',
        topicId: 'D2',
        topicName: 'Cấu trúc và tương tác, cải tiến hệ thống',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Vai trò của dữ liệu',
        requirement: 'Giải thích được ở mức độ cơ bản về vai trò của dữ liệu trong việc “dạy” AI trong một tình huống cụ thể.'
      },
      {
        code: '2.D2.2',
        topicId: 'D2',
        topicName: 'Cấu trúc và tương tác, cải tiến hệ thống',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Vai trò của dữ liệu',
        requirement: 'Giải thích được ở mức độ cơ bản rằng cần cung cấp cho AI dữ liệu chính xác, rõ ràng để AI đưa ra kết quả đúng.'
      },
      {
        code: '2.D2.MR1',
        topicId: 'D2',
        topicName: 'Cấu trúc và tương tác, cải tiến hệ thống',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Vai trò của dữ liệu',
        requirement: 'Thực hành thu thập một số dữ liệu để “dạy” AI trong một tình huống cụ thể.',
        isExtended: true
      }
    ]
  },
  '3': {
    grade: '3',
    level: 'TH',
    summary: 'Cách dùng AI trong học tập, không phụ thuộc hoàn toàn, phân biệt thật-giả, dữ liệu học máy và cấu trúc nếu-thì.',
    codes: [
      {
        code: '3.A1.1',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Cách sử dụng AI trong học tập',
        requirement: 'Nhận biết được một số tình huống sử dụng AI hỗ trợ học sinh trong quá trình học tập.'
      },
      {
        code: '3.A1.2',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Cách sử dụng AI trong học tập',
        requirement: 'Nêu được cách sử dụng trợ lí học tập thông minh, ứng dụng học ngôn ngữ để hỗ trợ quá trình học tập.'
      },
      {
        code: '3.A1.3',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Không phụ thuộc hoàn toàn vào AI',
        requirement: 'Phân biệt được giữa việc sử dụng AI như công cụ hỗ trợ (đúng đắn, chủ động, có kiểm soát) và việc để AI làm thay toàn bộ (thụ động, thiếu tự lập).'
      },
      {
        code: '3.A1.4',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Suy nghĩ kĩ trước khi dùng AI',
        requirement: 'Nêu được một số tình huống có thể gây rủi ro hoặc hậu quả không mong muốn khi sử dụng AI.'
      },
      {
        code: '3.A1.5',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Suy nghĩ kĩ trước khi dùng AI',
        requirement: 'Tự đặt và trả lời được một số câu hỏi trước khi quyết định sử dụng AI trong một tình huống cụ thể, ví dụ: Việc này có cần dùng AI không? Nếu AI đưa ra kết quả sai thì điều gì có thể xảy ra? …'
      },
      {
        code: '3.A1.MR1',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Cách sử dụng AI trong học tập',
        requirement: 'Thực hành sử dụng trợ lí học tập thông minh, ứng dụng học ngôn ngữ.',
        isExtended: true
      },
      {
        code: '3.A1.MR2',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Không phụ thuộc hoàn toàn vào AI',
        requirement: 'Nêu được hậu quả của việc phụ thuộc quá mức vào AI, như: giảm khả năng tư duy độc lập và sáng tạo; mất dần kĩ năng giải quyết vấn đề; ảnh hưởng đến sự tự tin và bản lĩnh cá nhân.',
        isExtended: true
      },
      {
        code: '3.A1.MR3',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Suy nghĩ kĩ trước khi dùng AI',
        requirement: 'Giải thích được rằng việc suy nghĩ và kiểm tra trước khi dùng AI giúp con người phòng tránh rủi ro, bảo vệ an toàn và quyền riêng tư, đồng thời đảm bảo AI được sử dụng vì mục đích tốt.',
        isExtended: true
      },
      {
        code: '3.A2.1',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI trong trường học',
        requirement: 'Nhận biết được một số ứng dụng hoặc thiết bị có sử dụng AI trong trường học, chẳng hạn như: robot hoặc bảng thông minh, ứng dụng chấm bài hoặc nhận dạng chữ viết.'
      },
      {
        code: '3.A2.2',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI trong trường học',
        requirement: 'Nêu được mục đích của việc sử dụng AI trong trường học là hỗ trợ giáo viên và học sinh học tập hiệu quả hơn, giúp: cá nhân hoá việc học theo năng lực từng học sinh; tăng hứng thú học tập thông qua các hoạt động tương tác.'
      },
      {
        code: '3.A2.3',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI hỗ trợ mọi người',
        requirement: 'Nêu được các đối tượng trong trường học mà AI có thể hỗ trợ, bao gồm: học sinh, giáo viên, …'
      },
      {
        code: '3.A2.MR1',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI trong trường học',
        requirement: 'Mô tả được trường học mong muốn trong tương lai – nơi có sự xuất hiện của một số ứng dụng, thiết bị AI.',
        isExtended: true
      },
      {
        code: '3.A2.MR2',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI trong trường học',
        requirement: 'Đề xuất được một số nguyên tắc khi sử dụng AI trong học tập.',
        isExtended: true
      },
      {
        code: '3.A2.MR3',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI hỗ trợ mọi người',
        requirement: 'Nêu được mục tiêu của AI trong bối cảnh trường học là hỗ trợ tất cả các thành viên của nhà trường, giúp việc dạy và học trở nên dễ dàng, hiệu quả và công bằng hơn.',
        isExtended: true
      },
      {
        code: '3.A3.1',
        topicId: 'A3',
        topicName: 'Công dân trong kỉ nguyên AI',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Kiểm tra và phản biện kết quả của AI',
        requirement: 'Nêu được một số ví dụ cụ thể về việc AI có thể sai, như: ứng dụng dịch sai nghĩa từ hoặc câu; AI nhận diện nhầm hình ảnh hoặc khuôn mặt; chatbot đưa ra thông tin không đúng sự thật.'
      },
      {
        code: '3.A3.2',
        topicId: 'A3',
        topicName: 'Công dân trong kỉ nguyên AI',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Kiểm tra và phản biện kết quả của AI',
        requirement: 'Trình bày được rằng khi sử dụng AI, học sinh cần kiểm tra lại kết quả, so sánh với nhiều nguồn thông tin khác nhau và trao đổi với giáo viên hoặc người lớn để xác minh.'
      },
      {
        code: '3.B2.1',
        topicId: 'B2',
        topicName: 'Sử dụng AI an toàn và có trách nhiệm',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Phân biệt thật và giả',
        requirement: 'Nhận biết và nêu được ví dụ về việc thông tin hoặc sản phẩm do AI tạo ra có thể không đúng với sự thật.'
      },
      {
        code: '3.B3.1',
        topicId: 'B3',
        topicName: 'Nguyên tắc đạo đức và trách nhiệm xã hội',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Cùng máy thông minh làm việc tốt',
        requirement: 'Nhận biết được rằng không nên tạo ra hoặc sử dụng AI cho các mục đích xấu như lừa đảo, bắt nạt hay gây hại cho người khác.'
      },
      {
        code: '3.B3.MR1',
        topicId: 'B3',
        topicName: 'Nguyên tắc đạo đức và trách nhiệm xã hội',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Cùng máy thông minh làm việc tốt',
        requirement: 'Nêu được rằng con người cần cung cấp dữ liệu đúng và đa dạng để AI hoạt động chính xác, công bằng.',
        isExtended: true
      },
      {
        code: '3.C4.1',
        topicId: 'C4',
        topicName: 'Dữ liệu trong AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Dữ liệu học máy',
        requirement: 'Trình bày được khái niệm dữ liệu thông qua một số ví dụ.'
      },
      {
        code: '3.C4.MR1',
        topicId: 'C4',
        topicName: 'Dữ liệu trong AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Dữ liệu học máy',
        requirement: 'Xác định được đặc trưng của một số bộ dữ liệu đơn giản.',
        isExtended: true
      },
      {
        code: '3.C5.1',
        topicId: 'C5',
        topicName: 'Kĩ thuật và thuật toán AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Kĩ thuật AI dựa trên luật',
        requirement: 'Mô tả được cấu trúc nếu … thì … trong việc giải quyết tình huống hoặc phân loại.'
      },
      {
        code: '3.C5.2',
        topicId: 'C5',
        topicName: 'Kĩ thuật và thuật toán AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Kĩ thuật học máy',
        requirement: 'Nêu được đặc điểm chính của học máy là học trên dữ liệu.'
      },
      {
        code: '3.C5.3',
        topicId: 'C5',
        topicName: 'Kĩ thuật và thuật toán AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Kĩ thuật học máy',
        requirement: 'Nêu được một số tình huống có thể áp dụng học máy (ví dụ: phân loại rau củ trong nông trại thông minh, dự báo mưa lũ, …).'
      },
      {
        code: '3.C5.4',
        topicId: 'C5',
        topicName: 'Kĩ thuật và thuật toán AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Kĩ thuật học máy',
        requirement: 'Nhận biết được bài toán học máy phân loại và bài toán học máy dự đoán thông qua tình huống cụ thể.'
      },
      {
        code: '3.C5.MR1',
        topicId: 'C5',
        topicName: 'Kĩ thuật và thuật toán AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Kĩ thuật AI dựa trên luật',
        requirement: 'Nêu được một số công cụ AI đơn giản sử dụng cấu trúc “nếu … thì …”.',
        isExtended: true
      },
      {
        code: '3.C5.MR2',
        topicId: 'C5',
        topicName: 'Kĩ thuật và thuật toán AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Kĩ thuật học máy',
        requirement: 'Minh họa được bài toán học máy phân loại và bài toán học máy dự đoán bằng các công cụ mã nguồn mở hoặc miễn phí như Teachable Machine, ML for Kids tích hợp trong Scratch, hoặc một số công cụ phù hợp khác.',
        isExtended: true
      },
      {
        code: '3.D1.1',
        topicId: 'D1',
        topicName: 'Nhận diện và hình thành giải pháp',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Quá trình huấn luyện máy thông minh',
        requirement: 'Trình bày được quá trình đơn giản để huấn luyện AI gồm các bước: thu thập ví dụ và cho AI học từ các ví dụ đó.'
      },
      {
        code: '3.D2.1',
        topicId: 'D2',
        topicName: 'Cấu trúc và tương tác, cải tiến hệ thống',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Dữ liệu tốt cho máy thông minh',
        requirement: 'Nêu được rằng dữ liệu dùng để dạy AI có thể bị thiếu, nhầm lẫn hoặc không đúng sự thật.'
      },
      {
        code: '3.D2.2',
        topicId: 'D2',
        topicName: 'Cấu trúc và tương tác, cải tiến hệ thống',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Dữ liệu tốt cho máy thông minh',
        requirement: 'Nêu được một số yêu cầu cơ bản đối với dữ liệu dùng để huấn luyện AI.'
      },
      {
        code: '3.D2.3',
        topicId: 'D2',
        topicName: 'Cấu trúc và tương tác, cải tiến hệ thống',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Máy thông minh có thể học sai',
        requirement: 'Trình bày được rằng nếu dữ liệu sai hoặc không tốt thì AI sẽ không hiệu quả, thậm chí hoạt động sai.'
      },
      {
        code: '3.D2.MR1',
        topicId: 'D2',
        topicName: 'Cấu trúc và tương tác, cải tiến hệ thống',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Dữ liệu tốt cho máy thông minh',
        requirement: 'Thực hành kiểm tra một bộ thẻ dữ liệu mẫu và loại bỏ được các thẻ gán nhãn nhầm, thẻ không đúng sự thật.',
        isExtended: true
      }
    ]
  },
  '4': {
    grade: '4',
    level: 'TH',
    summary: 'AI trong công việc hằng ngày, bảo vệ thông tin cá nhân, thực hành công cụ học máy trực quan (Teachable Machine), cải tiến AI.',
    codes: [
      {
        code: '4.A1.1',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI trong công việc hằng ngày',
        requirement: 'Trình bày được một số lĩnh vực hoặc công việc cụ thể mà trí tuệ nhân tạo (AI) có thể hỗ trợ con người, chẳng hạn như nông nghiệp, y tế, giao thông, …'
      },
      {
        code: '4.A1.2',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI hỗ trợ, con người suy nghĩ',
        requirement: 'Nhận biết được rằng trí tuệ nhân tạo (AI) được tạo ra để hỗ trợ con người học tập và làm việc hiệu quả hơn nhưng không thể thay thế tư duy, cảm xúc và sự sáng tạo của con người.'
      },
      {
        code: '4.A1.MR1',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI hỗ trợ, con người suy nghĩ',
        requirement: 'Nêu được ví dụ cụ thể về việc AI hỗ trợ trong học tập và giải thích được vì sao người học vẫn cần tự suy nghĩ, kiểm tra và hiểu bài thay vì chỉ chép kết quả do AI đưa ra.',
        isExtended: true
      },
      {
        code: '4.A2.1',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI vì cuộc sống tốt đẹp hơn',
        requirement: 'Nêu được rằng AI được con người tạo ra để hỗ trợ các hoạt động trong đời sống xã hội, giúp giải quyết vấn đề, tiết kiệm thời gian và nâng cao chất lượng cuộc sống.'
      },
      {
        code: '4.A2.2',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI trong xã hội',
        requirement: 'Trình bày được các đối tượng trong xã hội AI có thể hỗ trợ, bao gồm: người lao động, người yếu thế, …'
      },
      {
        code: '4.A3.1',
        topicId: 'A3',
        topicName: 'Công dân trong kỉ nguyên AI',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Con người quyết định khi dùng AI',
        requirement: 'Trình bày được rằng việc quyết định có sử dụng AI hay không phụ thuộc vào mục đích, nhu cầu và sự an toàn của con người.'
      },
      {
        code: '4.A3.MR1',
        topicId: 'A3',
        topicName: 'Công dân trong kỉ nguyên AI',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Con người quyết định khi dùng AI',
        requirement: 'Thực hành đưa quyết định có sử dụng AI hay không trong một số tình huống cụ thể: Nếu AI mang lại lợi ích, giúp tiết kiệm thời gian, tăng hiệu quả hoặc đảm bảo an toàn, con người có thể lựa chọn sử dụng. Nếu AI gây rủi ro, xâm phạm quyền riêng tư, hoặc ảnh hưởng đến giá trị đạo đức, con người có quyền từ chối hoặc dừng sử dụng.',
        isExtended: true
      },
      {
        code: '4.B2.1',
        topicId: 'B2',
        topicName: 'Sử dụng AI an toàn và có trách nhiệm',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Bảo vệ thông tin cá nhân',
        requirement: 'Nêu được một số loại thông tin cá nhân cần được giữ bí mật và không nên chia sẻ cho AI.'
      },
      {
        code: '4.B2.2',
        topicId: 'B2',
        topicName: 'Sử dụng AI an toàn và có trách nhiệm',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Bảo vệ thông tin cá nhân',
        requirement: 'Nêu được một số hậu quả khi thông tin cá nhân bị lộ hoặc bị lợi dụng.'
      },
      {
        code: '4.B2.MR1',
        topicId: 'B2',
        topicName: 'Sử dụng AI an toàn và có trách nhiệm',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Bảo vệ thông tin cá nhân',
        requirement: 'Thực hành xử lí theo hướng dẫn một tình huống giả định đơn giản về việc bị lộ thông tin cá nhân khi dùng AI.',
        isExtended: true
      },
      {
        code: '4.C2.1',
        topicId: 'C2',
        topicName: 'Ứng dụng AI trong học tập và cuộc sống',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Một số ứng dụng AI quen thuộc',
        requirement: 'Nêu được các ứng dụng của AI trong học tập và đời sống, đặc biệt là các ứng dụng gần gũi với bối cảnh Việt Nam.'
      },
      {
        code: '4.C2.MR1',
        topicId: 'C2',
        topicName: 'Ứng dụng AI trong học tập và cuộc sống',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Một số ứng dụng AI quen thuộc',
        requirement: 'Thực hành trải nghiệm một số ứng dụng AI trong học tập và đời sống.',
        isExtended: true
      },
      {
        code: '4.C5.MR1',
        topicId: 'C5',
        topicName: 'Kĩ thuật và thuật toán AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Làm quen với một số công cụ trải nghiệm kĩ thuật học máy',
        requirement: 'Thực hiện lại được theo từng bước các thao tác cơ bản với công cụ trải nghiệm AI trực quan dựa trên học máy có giám sát như Teachable Machine, ML for Kids tích hợp trong Scratch, hoặc một số công cụ phù hợp khác theo hướng dẫn mẫu của giáo viên: (1) mở công cụ và đặt tên cho các nhóm cần phân loại; (2) đưa vào mỗi nhóm một số hình ảnh mẫu; (3) bấm lệnh cho máy học từ các mẫu đó; (4) đưa một hình ảnh mới vào và quan sát kết quả máy đưa ra.',
        isExtended: true
      },
      {
        code: '4.C5.MR2',
        topicId: 'C5',
        topicName: 'Kĩ thuật và thuật toán AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Làm quen với một số công cụ trải nghiệm kĩ thuật học máy',
        requirement: 'Lặp lại được đầy đủ bốn bước trên với một nhóm dữ liệu tự chọn khác và mô tả được thao tác ở mỗi bước đã làm.',
        isExtended: true
      },
      {
        code: '4.D1.1',
        topicId: 'D1',
        topicName: 'Nhận diện và hình thành giải pháp',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Từ vấn đề đến ý tưởng AI',
        requirement: 'Nêu được một số ý tưởng ban đầu về cách AI có thể học hoặc giúp giải quyết vấn đề, ưu tiên các vấn đề gần gũi với bối cảnh Việt Nam, ví dụ: AI học từ ảnh các loại rác để phân loại rác tái chế.'
      },
      {
        code: '4.D1.MR1',
        topicId: 'D1',
        topicName: 'Nhận diện và hình thành giải pháp',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Từ vấn đề đến ý tưởng AI',
        requirement: 'Trình bày được cách sử dụng AI để giải quyết vấn đề trong tình huống đơn giản, ưu tiên các vấn đề gần gũi với bối cảnh Việt Nam, ví dụ: AI học từ giọng nói và chữ viết của đồng bào dân tộc thiểu số để dịch sang tiếng phổ thông, giúp học sinh vùng cao học tập thuận lợi hơn.',
        isExtended: true
      },
      {
        code: '4.D2.1',
        topicId: 'D2',
        topicName: 'Cấu trúc và tương tác, cải tiến hệ thống',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Liên tục cải tiến AI',
        requirement: 'Trình bày được rằng con người cần liên tục đánh giá và nâng cấp sản phẩm để hệ thống AI cho ra kết quả tốt hơn.'
      }
    ]
  },
  '5': {
    grade: '5',
    level: 'TH',
    summary: 'Con người chịu trách nhiệm cuối cùng, AI phục vụ lợi ích chung, hệ thống AI công bằng, quy trình huấn luyện và cải tiến mô hình.',
    codes: [
      {
        code: '5.A1.1',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Con người chịu trách nhiệm',
        requirement: 'Trình bày được rằng AI có thể thực hiện một số công việc thay con người, đặc biệt là những việc lặp đi lặp lại, nguy hiểm hoặc đòi hỏi tính chính xác cao, như: robot lắp ráp sản phẩm trong nhà máy; AI kiểm tra lỗi trong sản xuất; xe tự lái chở hàng hoá.'
      },
      {
        code: '5.A1.2',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Con người chịu trách nhiệm',
        requirement: 'Nêu được ví dụ cụ thể về trách nhiệm của người tạo và sử dụng AI, ví dụ: nếu AI chẩn đoán sai thì bác sĩ vẫn là người chịu trách nhiệm cuối cùng.'
      },
      {
        code: '5.A1.MR1',
        topicId: 'A1',
        topicName: 'Tính chủ động của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Con người chịu trách nhiệm',
        requirement: 'Trình bày được con người chịu trách nhiệm cuối cùng về mọi quyết định hoặc kết quả do AI tạo ra.',
        isExtended: true
      },
      {
        code: '5.A2.1',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI không thay thế con người',
        requirement: 'Giải thích được rằng mục đích chính của AI là hỗ trợ con người, chứ không thay thế vai trò, tư duy, cảm xúc và trách nhiệm của con người trong xã hội.'
      },
      {
        code: '5.A2.2',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI phục vụ lợi ích chung',
        requirement: 'Trình bày được rằng AI được con người tạo ra nhằm phục vụ lợi ích chung của xã hội, giúp cải thiện chất lượng cuộc sống, giải quyết các vấn đề phức tạp và hỗ trợ con người trong nhiều lĩnh vực khác nhau.'
      },
      {
        code: '5.A2.3',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI phục vụ lợi ích chung',
        requirement: 'Nêu được ví dụ cụ thể về việc AI mang lại lợi ích cho cộng đồng: y tế, giáo dục, môi trường.'
      },
      {
        code: '5.A2.MR1',
        topicId: 'A2',
        topicName: 'AI vì sự tiến bộ của con người',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'AI không thay thế con người',
        requirement: 'Trình bày được rằng dù AI làm được nhiều việc, nhưng chỉ con người mới có khả năng suy nghĩ sáng tạo, hiểu cảm xúc và đưa ra quyết định đạo đức – vì vậy, con người phải luôn kiểm soát, định hướng và chịu trách nhiệm về cách AI được sử dụng.',
        isExtended: true
      },
      {
        code: '5.A3.1',
        topicId: 'A3',
        topicName: 'Công dân trong kỉ nguyên AI',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Con người trong kỉ nguyên AI',
        requirement: 'Trình bày được rằng AI đang ngày càng trở nên phổ biến trong cuộc sống, vì vậy mọi người – dù là trẻ em, người lớn hay người cao tuổi – đều cần hiểu và biết cách sử dụng AI để phục vụ cuộc sống, học tập và công việc một cách an toàn, hiệu quả.'
      },
      {
        code: '5.A3.2',
        topicId: 'A3',
        topicName: 'Công dân trong kỉ nguyên AI',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Con người trong kỉ nguyên AI',
        requirement: 'Trình bày được rằng việc sử dụng AI phải phù hợp với nhu cầu, khả năng và mục đích của từng người, tránh lạm dụng hoặc sử dụng không an toàn (ví dụ: chia sẻ thông tin cá nhân, tin tưởng tuyệt đối vào AI).'
      },
      {
        code: '5.A3.MR1',
        topicId: 'A3',
        topicName: 'Công dân trong kỉ nguyên AI',
        domainId: 'NLa',
        domainName: 'Tư duy lấy con người làm trung tâm',
        contentTopic: 'Con người trong kỉ nguyên AI',
        requirement: 'Trình bày được ý tưởng về một số tình huống trong tương lai mà AI hỗ trợ trẻ em, người lớn hoặc người cao tuổi.',
        isExtended: true
      },
      {
        code: '5.B1.1',
        topicId: 'B1',
        topicName: 'Các khía cạnh đạo đức của AI',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Hệ thống AI công bằng',
        requirement: 'Nêu được một số ví dụ về sự công bằng hoặc không công bằng trong một số tình huống đơn giản, trong đời sống và khi AI phục vụ con người.'
      },
      {
        code: '5.B1.2',
        topicId: 'B1',
        topicName: 'Các khía cạnh đạo đức của AI',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Hệ thống AI công bằng',
        requirement: 'Giải thích được rằng AI cần phục vụ con người một cách công bằng, không phân biệt giới tính, vùng miền, điều kiện kinh tế hay hoàn cảnh khác nhau.'
      },
      {
        code: '5.B2.1',
        topicId: 'B2',
        topicName: 'Sử dụng AI an toàn và có trách nhiệm',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Giúp AI công bằng',
        requirement: 'Nêu được một số cách giúp AI hoạt động công bằng hơn, chẳng hạn như sử dụng dữ liệu đa dạng, tránh định kiến hoặc kiểm tra lại kết quả do AI tạo ra.'
      },
      {
        code: '5.B2.MR1',
        topicId: 'B2',
        topicName: 'Sử dụng AI an toàn và có trách nhiệm',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Giúp AI công bằng',
        requirement: 'Đề xuất được một số quy tắc khi thu thập dữ liệu để có được bộ dữ liệu đa dạng.',
        isExtended: true
      },
      {
        code: '5.B3.1',
        topicId: 'B3',
        topicName: 'Nguyên tắc đạo đức và trách nhiệm xã hội',
        domainId: 'NLb',
        domainName: 'Đạo đức AI',
        contentTopic: 'Cần hiểu cách AI suy nghĩ',
        requirement: 'Giải thích được vì sao con người cần hiểu cách AI đưa ra quyết định, nhằm đảm bảo tính minh bạch và độ tin cậy khi sử dụng AI.'
      },
      {
        code: '5.C5.1',
        topicId: 'C5',
        topicName: 'Kĩ thuật và thuật toán AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Thuật toán AI dựa trên luật',
        requirement: 'Nêu được cách sử dụng cấu trúc nếu … thì … trong lập trình AI đơn giản.'
      },
      {
        code: '5.C5.2',
        topicId: 'C5',
        topicName: 'Kĩ thuật và thuật toán AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Làm quen với một số công cụ ứng dụng học máy trực quan',
        requirement: 'Thực hiện được các thao tác cơ bản với công cụ trải nghiệm AI trực quan dựa trên học máy có giám sát như Teachable Machine, ML for Kids tích hợp trong Scratch, hoặc một số công cụ phù hợp khác.'
      },
      {
        code: '5.C5.MR1',
        topicId: 'C5',
        topicName: 'Kĩ thuật và thuật toán AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Thuật toán AI dựa trên luật',
        requirement: 'Thực hành sử dụng cấu trúc nếu … thì … trong lập trình AI đơn giản.',
        isExtended: true
      },
      {
        code: '5.C5.MR2',
        topicId: 'C5',
        topicName: 'Kĩ thuật và thuật toán AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Làm quen với một số công cụ ứng dụng học máy trực quan',
        requirement: 'Huấn luyện được một mô hình phân loại đơn giản trên công cụ trải nghiệm AI trực quan, ví dụ: phân loại lá cây khoẻ – lá cây bị sâu bệnh.',
        isExtended: true
      },
      {
        code: '5.C5.MR3',
        topicId: 'C5',
        topicName: 'Kĩ thuật và thuật toán AI',
        domainId: 'NLc',
        domainName: 'Các kĩ thuật và ứng dụng AI',
        contentTopic: 'Làm quen với một số công cụ ứng dụng học máy trực quan',
        requirement: 'Kiểm tra được kết quả do mô hình đưa ra, chỉ ra được những trường hợp mô hình phân loại sai.',
        isExtended: true
      },
      {
        code: '5.D1.1',
        topicId: 'D1',
        topicName: 'Nhận diện và hình thành giải pháp',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Quy trình huấn luyện AI',
        requirement: 'Mô tả được ở mức độ đơn giản về các bước cơ bản trong quá trình huấn luyện mô hình AI: xác định vấn đề, thu thập dữ liệu, dạy máy học, kiểm tra và đánh giá kết quả.'
      },
      {
        code: '5.D1.MR1',
        topicId: 'D1',
        topicName: 'Nhận diện và hình thành giải pháp',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Quy trình huấn luyện AI',
        requirement: 'Thực hành thu thập dữ liệu nhằm huấn luyện mô hình AI giải quyết một vấn đề đơn giản.',
        isExtended: true
      },
      {
        code: '5.D2.1',
        topicId: 'D2',
        topicName: 'Cấu trúc và tương tác, cải tiến hệ thống',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Cải tiến hệ thống AI bằng dữ liệu',
        requirement: 'Giải thích được bằng ví dụ rằng hệ thống AI có thể được cải tiến và hoạt động tốt hơn khi dữ liệu được bổ sung và cập nhật thường xuyên.'
      },
      {
        code: '5.D2.MR1',
        topicId: 'D2',
        topicName: 'Cấu trúc và tương tác, cải tiến hệ thống',
        domainId: 'NLd',
        domainName: 'Thiết kế hệ thống AI',
        contentTopic: 'Cải tiến hệ thống AI bằng dữ liệu',
        requirement: 'Thực hành cải tiến hệ thống AI bằng cách bổ sung dữ liệu.',
        isExtended: true
      }
    ]
  }
};
